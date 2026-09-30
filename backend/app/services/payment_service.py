import hmac
import hashlib
import json
import razorpay
from django.conf import settings
from ..models import PaymentTransaction

razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY)
)


class PaymentService:
    """
    Domain service for Razorpay order generation, signature verification,
    webhook processing, and user premium status entitlement.
    """

    @staticmethod
    def create_order(user, amount: float, currency: str = 'INR'):
        amount_in_paisa = int(float(amount) * 100)
        razorpay_order = razorpay_client.order.create(
            dict(
                amount=amount_in_paisa,
                currency=currency,
                payment_capture='1',
            )
        )
        order_id = razorpay_order['id']

        # Audit log the transaction
        if user and user.is_authenticated:
            PaymentTransaction.objects.create(
                user=user,
                order_id=order_id,
                amount=amount,
                currency=currency,
                status='CREATED',
            )

        return {
            'order_id': order_id,
            'amount': amount_in_paisa,
            'currency': currency,
            'key': settings.RAZORPAY_KEY_ID,
        }

    @staticmethod
    def verify_payment_and_grant_premium(user, razorpay_payment_id: str, razorpay_order_id: str, razorpay_signature: str):
        # Cryptographic verification via Razorpay utility
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        })

        # Upgrade the authenticated user
        user.isPremiumUser = True
        user.save()

        # Update or record audit log
        PaymentTransaction.objects.update_or_create(
            order_id=razorpay_order_id,
            defaults={
                'user': user,
                'payment_id': razorpay_payment_id,
                'signature': razorpay_signature,
                'status': 'PAID',
            }
        )
        return True

    @staticmethod
    def handle_webhook(raw_body: bytes, signature: str):
        """
        Validates Razorpay webhook signature and idempotently fulfills user premium status.
        """
        if not signature:
            return False, "Missing webhook signature"

        webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', '')
        
        # Verify HMAC-SHA256 signature
        expected_sig = hmac.new(
            webhook_secret.encode('utf-8'),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, signature):
            return False, "Invalid webhook signature"

        try:
            event_data = json.loads(raw_body.decode('utf-8'))
        except json.JSONDecodeError:
            return False, "Invalid JSON payload"

        event = event_data.get('event')
        payload = event_data.get('payload', {})

        if event in ['payment.captured', 'order.paid']:
            payment_entity = payload.get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')

            if order_id:
                txn = PaymentTransaction.objects.filter(order_id=order_id).first()
                if txn:
                    txn.payment_id = payment_id
                    txn.status = 'PAID'
                    txn.save()
                    txn.user.isPremiumUser = True
                    txn.user.save()
                    return True, "Payment fulfilled and user upgraded"

        return True, "Webhook processed successfully"

