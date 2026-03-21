import os
import uuid
import json
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import Flask, redirect, render_template, request, jsonify, current_app
from sqlalchemy import inspect, text
import jwt
from werkzeug.utils import secure_filename
from models import db, AdminUser, Article, ContentHistory


def create_app() -> Flask:
    app = Flask(__name__)

    database_url = os.getenv("DATABASE_URL", "sqlite:///pew_vizag.db")
    # Render/Heroku-style URLs can be "postgres://"; SQLAlchemy expects "postgresql://".
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-production")
    app.config["JWT_ALGORITHM"] = "HS256"
    app.config["JWT_EXPIRATION_HOURS"] = 24
    app.config["UPLOAD_FOLDER"] = os.path.join(app.static_folder, "uploads", "articles")
    app.config["ALLOWED_IMAGE_EXTENSIONS"] = {"png", "jpg", "jpeg", "gif", "webp"}
    app.config["TEMPLATES_AUTO_RELOAD"] = True
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
    app.jinja_env.auto_reload = True
    
    # Initialize database
    db.init_app(app)
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    
    with app.app_context():
        db.create_all()
        inspector = inspect(db.engine)
        if "article" in inspector.get_table_names():
            columns = {column["name"] for column in inspector.get_columns("article")}
            if "image_urls" not in columns:
                db.session.execute(text("ALTER TABLE article ADD COLUMN image_urls TEXT"))
                db.session.commit()
        if "content_history" in inspector.get_table_names():
            history_columns = {column["name"] for column in inspector.get_columns("content_history")}
            if "category" not in history_columns:
                db.session.execute(text("ALTER TABLE content_history ADD COLUMN category VARCHAR(30)"))
                db.session.commit()
        # Create initial admin if doesn't exist
        if not AdminUser.query.filter_by(username="admin").first():
            admin = AdminUser(username="admin")
            admin.set_password("admin123")  # Change this password!
            db.session.add(admin)
            db.session.commit()
            print("✅ Initial admin created: username='admin', password='admin123'")
    
    register_routes(app)
    return app


def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        
        if not token:
            return jsonify({"error": "Token required"}), 401
        
        try:
            payload = jwt.decode(
                token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=[current_app.config["JWT_ALGORITHM"]]
            )
            request.admin_id = payload["admin_id"]
            request.admin_username = payload["username"]
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function


def _is_allowed_image(filename: str, allowed_extensions: set[str]) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions


def _save_uploaded_image(image_file, app: Flask) -> str:
    filename = secure_filename(image_file.filename or "")
    if not filename:
        raise ValueError("Invalid image filename")
    if not _is_allowed_image(filename, app.config["ALLOWED_IMAGE_EXTENSIONS"]):
        raise ValueError("Unsupported image format")

    extension = filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{extension}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    image_file.save(save_path)
    return f"/static/uploads/articles/{unique_name}"


def _normalize_image_urls(image_urls: list[str]) -> list[str]:
    normalized = [url.strip() for url in image_urls if isinstance(url, str) and url.strip()]
    return normalized[:3]


def register_routes(app: Flask) -> None:
    
    # ==================== PUBLIC ROUTES ====================
    @app.get("/")
    def home():
        return render_template("index.html")

    @app.get("/about")
    def about():
        return render_template("about.html")

    @app.get("/about-certifications")
    def about_certifications():
        return render_template("about-certifications.html")

    @app.get("/about-leadership")
    def about_leadership():
        return render_template("about-leadership.html")

    @app.get("/about-milestones")
    def about_milestones():
        return render_template("about-milestones.html")

    @app.get("/about-values")
    def about_values():
        return render_template("about-values.html")

    @app.get("/careers")
    def careers():
        return render_template("careers.html")

    @app.get("/contact")
    def contact():
        return render_template("contact.html")

    @app.get("/divisions")
    def divisions():
        return render_template("divisions.html")

    @app.get("/partners")
    def partners():
        return render_template("partners.html")

    @app.get("/media")
    def media_page():
        return render_template("media.html")

    @app.get("/media/article/<int:article_id>")
    def media_article_detail(article_id):
        article = Article.query.get_or_404(article_id)
        return render_template("media-article-detail.html", article=article)

    # ==================== ADMIN AUTH ROUTES ====================
    @app.get("/admin")
    def admin_login_page():
        """Render login page"""
        return render_template("admin/login.html")
    
    @app.post("/api/auth/login")
    def login():
        """Authenticate admin and return JWT token"""
        data = request.get_json()
        
        if not data or not data.get("username") or not data.get("password"):
            return jsonify({"error": "Missing credentials"}), 400
        
        admin = AdminUser.query.filter_by(username=data["username"]).first()
        
        if not admin or not admin.check_password(data["password"]):
            return jsonify({"error": "Invalid credentials"}), 401
        
        # Generate JWT token
        payload = {
            "admin_id": admin.id,
            "username": admin.username,
            "exp": datetime.now(timezone.utc) + timedelta(hours=app.config["JWT_EXPIRATION_HOURS"]),
            "iat": datetime.now(timezone.utc)
        }
        token = jwt.encode(
            payload,
            app.config["JWT_SECRET_KEY"],
            algorithm=app.config["JWT_ALGORITHM"]
        )
        
        return jsonify({
            "token": token,
            "username": admin.username,
            "message": "Login successful"
        }), 200
    
    @app.post("/api/auth/logout")
    @token_required
    def logout():
        """Logout (client-side removes token)"""
        return jsonify({"message": "Logout successful"}), 200

    # ==================== ADMIN DASHBOARD ROUTES ====================
    @app.get("/admin/dashboard")
    def admin_dashboard():
        """Render admin dashboard"""
        return render_template("admin/dashboard.html")
    
    @app.get("/admin/add")
    def admin_add_article():
        """Render article editor for creating new article"""
        return render_template("admin/editor.html")
    
    @app.get("/admin/edit/<int:article_id>")
    def admin_edit_article(article_id):
        """Render article editor for editing article"""
        return render_template("admin/editor.html")

    @app.get("/api/admin/history")
    @token_required
    def get_history():
        """Get action history"""
        limit = request.args.get("limit", 50, type=int)
        history = ContentHistory.query.order_by(
            ContentHistory.created_at.desc()
        ).limit(limit).all()
        
        return jsonify({
            "history": [h.to_dict() for h in history]
        }), 200

    @app.delete("/api/admin/history")
    @token_required
    def clear_history():
        """Clear all action history"""
        deleted_count = ContentHistory.query.delete()
        db.session.commit()
        return jsonify({
            "message": "History cleared",
            "deleted": deleted_count
        }), 200

    # ==================== ADMIN API ROUTES - ARTICLES ====================
    @app.get("/api/articles")
    def get_articles():
        """Get all articles (public endpoint)"""
        articles = Article.query.order_by(Article.created_at.desc()).all()
        return jsonify({
            "articles": [a.to_dict() for a in articles]
        }), 200
    
    @app.post("/api/articles")
    @token_required
    def create_article():
        """Create new article"""
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form.to_dict()
            image_urls = request.form.getlist("image_urls")
        else:
            data = request.get_json()
            image_urls = data.get("image_urls", []) if data else []
        
        if not data or not all(k in data for k in ["title", "content", "category"]):
            return jsonify({"error": "Missing required fields"}), 400

        image_url = data.get("image_url")
        if image_url:
            image_urls.append(image_url)

        image_files = request.files.getlist("image_files")
        if not image_files:
            image_file = request.files.get("image_file")
            if image_file and image_file.filename:
                image_files = [image_file]

        saved_urls = []
        for image_file in image_files[:3]:
            if image_file and image_file.filename:
                try:
                    saved_urls.append(_save_uploaded_image(image_file, app))
                except ValueError as exc:
                    return jsonify({"error": str(exc)}), 400

        combined_urls = _normalize_image_urls([*saved_urls, *image_urls])
        primary_url = combined_urls[0] if combined_urls else None
        
        article = Article(
            title=data["title"],
            content=data["content"],
            category=data["category"],
            image_url=primary_url,
            image_urls=json.dumps(combined_urls) if combined_urls else None
        )
        db.session.add(article)
        db.session.flush()  # Get the ID before commit
        
        # Log action
        history = ContentHistory(
            action="CREATE",
            entity_type="Article",
            entity_id=article.id,
            category=article.category,
            details=f"Created article: {article.title}",
            admin_username=request.admin_username
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            "message": "Article created",
            "article": article.to_dict()
        }), 201
    
    @app.get("/api/articles/<int:article_id>")
    def get_article(article_id):
        """Get single article"""
        article = Article.query.get_or_404(article_id)
        return jsonify(article.to_dict()), 200
    
    @app.put("/api/articles/<int:article_id>")
    @token_required
    def update_article(article_id):
        """Update article"""
        article = Article.query.get_or_404(article_id)
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            data = request.form.to_dict()
            image_urls = request.form.getlist("image_urls")
        else:
            data = request.get_json()
            image_urls = data.get("image_urls", []) if data else []

        if not data:
            return jsonify({"error": "Missing update payload"}), 400
        
        if "title" in data:
            article.title = data["title"]
        if "content" in data:
            article.content = data["content"]
        if "category" in data:
            article.category = data["category"]
        image_url = data.get("image_url")
        if image_url:
            image_urls.append(image_url)

        image_files = request.files.getlist("image_files")
        if not image_files:
            image_file = request.files.get("image_file")
            if image_file and image_file.filename:
                image_files = [image_file]

        saved_urls = []
        for image_file in image_files[:3]:
            if image_file and image_file.filename:
                try:
                    saved_urls.append(_save_uploaded_image(image_file, app))
                except ValueError as exc:
                    return jsonify({"error": str(exc)}), 400

        normalized_urls = _normalize_image_urls(image_urls)
        input_provided = bool(saved_urls) or bool(normalized_urls) or bool(image_url)
        if input_provided:
            combined_urls = _normalize_image_urls([*saved_urls, *normalized_urls])
            article.image_url = combined_urls[0] if combined_urls else None
            article.image_urls = json.dumps(combined_urls) if combined_urls else None
        
        db.session.commit()
        
        # Log action
        history = ContentHistory(
            action="UPDATE",
            entity_type="Article",
            entity_id=article.id,
            category=article.category,
            details=f"Updated article: {article.title}",
            admin_username=request.admin_username
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({
            "message": "Article updated",
            "article": article.to_dict()
        }), 200
    
    @app.delete("/api/articles/<int:article_id>")
    @token_required
    def delete_article(article_id):
        """Delete article"""
        article = Article.query.get_or_404(article_id)
        title = article.title
        
        db.session.delete(article)
        db.session.flush()
        
        # Log action
        history = ContentHistory(
            action="DELETE",
            entity_type="Article",
            entity_id=article_id,
            category=article.category,
            details=f"Deleted article: {title}",
            admin_username=request.admin_username
        )
        db.session.add(history)
        db.session.commit()
        
        return jsonify({"message": "Article deleted"}), 200


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
