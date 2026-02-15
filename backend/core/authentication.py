from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that does NOT enforce CSRF.
    
    DRF's default SessionAuthentication calls enforce_csrf() on every
    request, which rejects cross-origin requests from the React frontend.
    This subclass skips that check while still reading the session cookie
    to populate request.user.
    """

    def enforce_csrf(self, request):
        # Skip CSRF validation entirely
        return
