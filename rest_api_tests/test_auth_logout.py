"""Authentication logout tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import (
    User,
    Session,
    db,
    client,
    app,
    pytest,
    datetime,
    timedelta,
    bcrypt,
    delete_db_records,
)


@pytest.fixture(autouse=True)
def init_logout_tests_environment(app):
    """Create a user and their session before each"""
    with app.app_context():
        hashed_password = bcrypt.hashpw(
            "password".encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        u = User(email="test@example.com", password_hash=hashed_password)
        db.session.add(u)

        s = Session(
            session_token="1111",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )
        db.session.add(s)
        db.session.commit()


def test_logout_success(client, app):
    """Test that the user can successfully logout"""
    client.set_cookie("session-id", "1111")
    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert response.json == {"success": True, "message": "User logout successful"}
    assert "Set-Cookie" in response.headers

    # Adjust the assertion to handle date formatting differences
    set_cookie_header = response.headers["Set-Cookie"]
    assert "session-id=; Expires=Thu, 01 Jan 1970 00:00:00 GMT" in set_cookie_header
    assert "Path=/" in set_cookie_header

    with app.app_context():
        assert db.session.query(Session).count() == 0


def test_logout_no_session(client):
    """Test that logout fails when no session cookie is present"""
    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert response.json == {"success": True, "message": "User logout successful"}


def test_logout_invalid_session(client):
    """Test that logout succeeds when the session cookie is invalid"""
    client.set_cookie("session-id", "invalid-session-id")
    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert response.json == {"success": True, "message": "User logout successful"}


def test_logout_session_already_deleted(client, app):
    """Test that logout handles an already deleted session gracefully"""
    client.set_cookie("session-id", "1111")

    with app.app_context():
        db.session.query(Session).filter_by(session_token="1111").delete()
        db.session.commit()

    response = client.post("/api/auth/logout")

    assert response.status_code == 200
    assert response.json == {"success": True, "message": "User logout successful"}
