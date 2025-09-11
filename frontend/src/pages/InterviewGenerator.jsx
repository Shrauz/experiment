import React, { useState } from 'react';

const InterviewGenerator = () => {
    const [experience, setExperience] = useState('');
    const [field, setField] = useState('');
    const [languages, setLanguages] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateInterview = async () => {
        if (!experience || !field || !languages) {
            setError('Please fill in all fields.');
            return;
        }

        setLoading(true);
        setError('');
        setQuestions([]);

        try {
            const response = await fetch('http://localhost:5000/api/generate-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experience, field, languages }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate questions.');
            }

            setQuestions(data.questions);
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred while generating questions.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl w-full">
                <h1 className="text-2xl font-bold mb-4 text-center">Interview Question Generator</h1>

                <div className="space-y-4">
                    <div>
                        <label className="block mb-1">Experience</label>
                        <select value={experience} onChange={(e) => { setExperience(e.target.value); setError(''); }} className="w-full p-2 border rounded-lg" disabled={loading}>
                            <option value="">Select experience</option>
                            <option value="1 year">1 year</option>
                            <option value="3 years">3 years</option>
                            <option value="5+ years">5+ years</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Field</label>
                        <select value={field} onChange={(e) => { setField(e.target.value); setError(''); }} className="w-full p-2 border rounded-lg" disabled={loading}>
                            <option value="">Select field</option>
                            <option value="Software Development">Software Development</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Marketing">Marketing</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Languages</label>
                        <select value={languages} onChange={(e) => { setLanguages(e.target.value); setError(''); }} className="w-full p-2 border rounded-lg" disabled={loading}>
                            <option value="">Select languages</option>
                            <option value="Python">Python</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="Java">Java</option>
                            <option value="C++">C++</option>
                        </select>
                    </div>

                    <button
                        onClick={generateInterview}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Generating...' : 'Generate Interview'}
                    </button>
                </div>

                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                {Array.isArray(questions) && questions.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-3">Generated Questions</h2>
                        <ul className="space-y-4">
                            {questions.map((q, index) => (
                                <li key={index} className="border p-4 rounded-lg bg-gray-100">
                                    <p className="font-medium">{index + 1}. {q.question_text}</p>
                                    <ul className="mt-2 space-y-1">
                                        {q.options.map((opt, i) => (
                                            <li key={i} className="pl-4 list-disc">{opt}</li>
                                        ))}
                                    </ul>
                                    <p className="mt-2 text-sm text-gray-700">✅ Correct: {q.correct_answer}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewGenerator;
