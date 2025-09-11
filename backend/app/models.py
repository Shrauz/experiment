from app.extensions import db, bcrypt

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    
    # A user can have multiple interviews.
    interviews = db.relationship('Interview', backref='interviewer', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Interview(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # This stores the user's ID to link the interview to the creator.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # An interview can have multiple questions.
    questions = db.relationship('Question', backref='interview', lazy=True)

    def __repr__(self):
        return f'<Interview {self.id}>'

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(500), nullable=False)
    expected_answer_keywords = db.Column(db.String(500), nullable=False)

    # This links the question to a specific interview.
    interview_id = db.Column(db.Integer, db.ForeignKey('interview.id'), nullable=False)

    def __repr__(self):
        return f'<Question {self.question_text}>'
