from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import User , User_details

class UserAdmin(DefaultUserAdmin):
    # Fields to display in the admin panel
    list_display = ('username', 'email', 'isPremiumUser', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Premium Status', {'fields': ('isPremiumUser',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'isPremiumUser')}
        ),
    )

admin.site.register(User, UserAdmin)

admin.site.register(User_details)
