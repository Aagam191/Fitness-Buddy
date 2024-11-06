import React from 'react'

export default function Footer() {
    return (
        <div>
            <section class="footer">
                <div class="box-container">
                    <div class="box">
                        <h3>Quick Links</h3>
                        <a class="links" href="/">Home</a>
                        
                        <a class='links' href="/directory">Directory</a>
                        <a class='links' href="/calculate_bmi">BMI Calculator</a>
                        <a class='links' href="/predict">Diet</a>

                    </div>

                    <div class="box">
                        <h3>Contact Us</h3>
                        <p><i class="fas fa-phone"></i>+919076534789</p>
                        <p><i class="fas fa-phone"></i>+919234526278</p>
                        <p><i class="fas fa-phone"></i>+919873356899</p>
                    </div>

                    <div class="box">
                        <h3>Follow us on</h3>
                        <div class="share">
                            <a href="https://www.facebook.com/" class="fab fa-facebook-f"></a>
                            <a href="https://www.twitter.com/" class="fab fa-twitter"></a>
                            <a href="https://www.linkedin.com/" class="fab fa-linkedin"></a>
                            <a href="https://www.instagram.com/" class="fab fa-instagram"></a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
