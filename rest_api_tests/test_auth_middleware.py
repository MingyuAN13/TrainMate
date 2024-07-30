"""Authorization middleware tests"""

# pylint: disable=unused-import
# pylint: disable=redefined-outer-name
from . import (
    User,
    Role,
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


def test_authorized(client, app):
    """Test that the user is authorized successfully when they have rights to a resource"""
    with app.app_context():
        u = User(email="test@test.com", password_hash="")
        db.session.add(u)
        u.roles.append(Role.query.filter_by(name="Admin").first())

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="1111",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(s)
        db.session.commit()

        client.set_cookie("session-id", "1111")

        response = client.post(
            "/api/tags/admin",
            headers={
                "Content-Type": "application/json",
            },
            json={"name": "test"},
        )

    assert response.status_code == 200


def test_not_authorized_wrong_user(client, app):
    """Test that the user is not authorized successfully when they have no rights to a
    resource due to wrong user"""

    with app.app_context():
        u = User(email="test@test.com", password_hash="")
        u.roles.append(Role.query.filter_by(name="Admin").first())

        wrong_user = User(email="wrong@test.com", password_hash="")

        s = Session(
            session_token="1111",
            user=wrong_user,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(u)
        db.session.commit()

        db.session.add(s)
        db.session.commit()

        client.set_cookie("session-id", "1111")
        response = client.get("/api/tags/admin")

        assert response.status_code == 401


def test_not_authorized_role(client, app):
    """Test that the user is not authorized successfully when they have no rights to a resource"""

    with app.app_context():
        u = User(email="test@test.com", password_hash="")
        u.roles.append(Role.query.filter_by(name="AI Researcher").first())

        db.session.add(u)
        db.session.commit()

        s = Session(
            session_token="1111",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(s)
        db.session.commit()

        client.set_cookie("session-id", "1111")

        response = client.get("/api/tags/admin")

        assert response.status_code == 401


def test_excluded_routes_authenticate(client, app):
    """Test that login route is excluded from middleware authorization"""
    with app.app_context():
        hashed_password = bcrypt.hashpw(
            "password".encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

        u = User(email="test@example.com", password_hash=hashed_password)
        db.session.add(u)
        db.session.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password"},
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 200


def test_excluded_routes_register_user(client):
    """Test that login route is excluded from middleware authorization"""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@test.com",
            "passwordHash": "$2a$10$f0pJ/i6bc./P4ITlElnFGe5LXhi8tODEE/Bc4CLLw7kal2kteDWy6",
        },
        headers={"Content-Type": "application/json"},
    )

    assert response.status_code == 200


# Session tests upon validation
def test_expired_session_deletion_upon_authorization(client, app):
    """Test whether an expired session is deleted upon authorization towards a specific page"""
    # Set up the expired session
    with app.app_context():
        u = User(email="test@test.com", password_hash="")
        s = Session(session_token="1111", user=u, expiration_datetime=datetime.now())
        db.session.add(s)
        db.session.commit()

    # set the cookie session-id
    client.set_cookie("session-id", "1111")
    client.post(
        "/api/tag",
        json={
            "email": "test@test.com",
            "passwordHash": "$2a$10$f0pJ/i6bc./P4ITlElnFGe5LXhi8tODEE/Bc4CLLw7kal2kteDWy6",
        },
        headers={"Content-Type": "application/json"},
    )

    with app.app_context():
        assert len(db.session.query(Session).all()) == 0


def test_not_authorized_wrong_session_token(client, app):
    """Test that the user is not authorized successfully when they have no rights to a
    resource due to wrong session token"""

    with app.app_context():
        u = User(
            email="test@test.com",
            password_hash="$2a$10$r43JX95nFTCH3KrVzzfrLObPhWZpQt4BAFA.lwr/r7JrG.9M9yGcy",
        )
        u.roles.append(Role.query.filter_by(name="AI Researcher").first())

        s = Session(
            session_token="1111",
            user=u,
            expiration_datetime=datetime.now() + timedelta(hours=1),
        )

        db.session.add(u)
        db.session.commit()

        db.session.add(s)
        db.session.commit()

    client.set_cookie("session-id", "2222")
    response = client.get("/api/tags")

    assert response.status_code == 401
