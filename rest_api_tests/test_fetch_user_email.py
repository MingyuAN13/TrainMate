"""Fetch user email tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import (
    User,
    Session,
    db,
    client,
    app,
    pytest,
    delete_db_records,
    Role,
    datetime,
    timedelta,
)


@pytest.fixture(autouse=True)
def init_roles_tests_environment(app):
    """Create a user and their session before each test"""
    with app.app_context():
        # Create user
        u = User(email="test@example.com", password_hash="hashed_password")
        db.session.add(u)

        # Create session
        s = Session(
            session_token="1111",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )
        db.session.add(s)
        db.session.commit()


def test_fetch_user_email_success(client):
    """Test that the user email is fetched successfully"""
    client.set_cookie("session-id", "1111")
    response = client.get("/api/users/email")

    assert response.status_code == 200
    assert response.json["success"] is True
    assert response.json["message"] == "Email fetch successful."
    assert "email" in response.json
    assert response.json["email"] == "test@example.com"


def test_fetch_user_email_no_session(client):
    """Test that fetching user email fails when no session cookie is present"""
    response = client.get("/api/users/email")

    assert response.status_code == 401
    assert response.json == {"success": False, "message": "No user in session."}
