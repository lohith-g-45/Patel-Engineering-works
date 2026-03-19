from flask import Flask, redirect, render_template


def create_app() -> Flask:
    app = Flask(__name__)
    register_routes(app)
    return app


def register_routes(app: Flask) -> None:

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

    @app.get("/admin")
    def admin_page():
        return redirect("/media")


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
