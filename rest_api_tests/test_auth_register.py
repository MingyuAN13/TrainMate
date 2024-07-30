"""Authentication register test"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import User, Role, Tag, db, client, app, pytest, bcrypt, delete_db_records


def test_register_user_email_success(client, app):
    """Test email register success when email does not exist"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "passwordHash": "$2a$10$.jLiKyxspNQpJtEqvF41IOmwMAv/ExRN4JjdgHSwK6AFr6fiYtoWe",
        },
    )

    # Check that tag was addedd successfully
    with app.app_context():
        assert Tag.query.filter_by(name="test@example.com").first() is not None

    assert response.status_code == 200
    assert response.json == {
        "success": True,
        "message": "User registered successfully.",
    }


def test_register_user_email_invalid_format(client, app):
    """Test email register failure with invalid email format"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email",
            "passwordHash": "$2a$10$.jLiKyxspNQpJtEqvF41IOmwMAv/ExRN4JjdgHSwK6AFr6fiYtoWe",
        },
    )

    # Check that tag was not created
    with app.app_context():
        assert Tag.query.filter_by(name="invalid-email").first() is None

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


def test_register_user_email_exists(client, app):
    """Test email register failure when email already exists"""
    with app.app_context():
        u = User(
            email="test@example.com",
            password_hash="$2a$10$.jLiKyxspNQpJtEqvF41IOmwMAv/ExRN4JjdgHSwK6AFr6fiYtoWe",
        )

        db.session.add(u)
        db.session.commit()

    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "passwordHash": "$2a$10$.jLiKyxspNQpJtEqvF41IOmwMAv/ExRN4JjdgHSwK6AFr6fiYtoWe",
        },
    )

    # Check that tag was not created
    with app.app_context():
        assert Tag.query.filter_by(name="test@example.com").first() is None

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


def test_check_password_invalid_format(client, app):
    """Test email register failure with invaild empty password format"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "passwordHash": "$2a$10$/a7o4MIWV.6Uy3Unv/kBuecrB8pd4h.1oet2uEtuaK8zkflbqaaDe",
        },
    )

    # Check that tag was not created
    with app.app_context():
        assert Tag.query.filter_by(name="test@example.com").first() is None

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


def test_empty_data_register(client, app):
    """Test register failure with empty json"""
    response = client.post("/api/auth/register", json={})

    # Check that tag was not created
    with app.app_context():
        assert Tag.query.filter_by(name="").first() is None

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


def test_excess_data_register(client, app):
    """Test register failure with json containing extra fields"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "passwordHash": "$2a$10$.jLiKyxspNQpJtEqvF41IOmwMAv/ExRN4JjdgHSwK6AFr6fiYtoWe",
            "extra": "extra",
        },
    )

    # Check that tag was not created
    with app.app_context():
        assert Tag.query.filter_by(name="test@example.com").first() is None

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}


def test_too_long_email_register(client, app):
    """Test register failure with email that's too long"""
    test_string = "a" * 1337
    test_mail = test_string + "@example.com"
    response = client.post(
        "/api/auth/register",
        json={
            "email": test_mail,
            "passwordHash": "$2a$10$.jLiKyxspNQpJtEqvF41IOmwMAv/ExRN4JjdgHSwK6AFr6fiYtoWe",
        },
    )

    # Check that tag was not created
    with app.app_context():
        assert Tag.query.filter_by(name=test_mail).first() is None

    assert response.status_code == 406
    assert response.json == {"success": False, "message": "Invalid Email or Password"}
