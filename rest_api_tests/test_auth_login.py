"""Authentication login tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import User, Session, db, client, app, pytest, bcrypt, delete_db_records


@pytest.fixture(autouse=True)
def init_login_tests_environment(app):
    """Create the user in the database before each test"""
    with app.app_context():
        hashed_password = bcrypt.hashpw(
            "password".encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")
        u = User(email="test@example.com", password_hash=hashed_password)
        db.session.add(u)
        db.session.commit()


def test_check_email_and_password_login_success(client):
    """Test login success with valid email and password"""
    response = client.post(
        "/api/auth/login", json={"email": "test@example.com", "password": "password"}
    )
    assert response.status_code == 200
    assert response.json == {"success": True, "message": "Authentication Successful."}


def test_check_email_and_password_login_invalid_email(client):
    """Test login failure with invalid email"""
    response = client.post(
        "/api/auth/login", json={"email": "nonexistent@example.com", "password": "password"}
    )

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


def test_check_email_and_password_login_invalid_password(client):
    """Test login failure with invalid password"""
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "passwordHash": "wrongpassword"},
    )

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


# Login session initialization testing


def test_session_created_upon_successful_login(client, app):
    """Test session creation success upon successful login"""
    test_check_email_and_password_login_success(client)

    with app.app_context():
        assert len(db.session.query(Session).all()) == 1


def test_session_not_created_upon_invalid_email(client, app):
    """Test session creation failure upon invalid email"""
    test_check_email_and_password_login_invalid_email(client)

    with app.app_context():
        assert len(db.session.query(Session).all()) == 0


def test_session_not_created_upon_invalid_password(client, app):
    """Test session creation failure upon invalid password"""
    test_check_email_and_password_login_invalid_email(client)

    with app.app_context():
        assert len(db.session.query(Session).all()) == 0
