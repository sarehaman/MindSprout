import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle, XCircle, RefreshCw, Award } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  onReset: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onReset }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  if (quizCompleted) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-yellow-100 rounded-full">
            <Award className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Quiz Completed!</h3>
        <p className="text-slate-600 mb-6">You scored {score} out of {questions.length}</p>
        <div className="w-full bg-slate-100 rounded-full h-4 mb-8">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-1000"
            style={{ width: `${(score / questions.length) * 100}%` }}
          />
        </div>
        <button 
          onClick={onReset}
          className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Another Topic
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="font-semibold text-indigo-900">Knowledge Check</h3>
        <span className="text-sm font-medium text-indigo-700">Question {currentQuestionIndex + 1} of {questions.length}</span>
      </div>
      
      <div className="p-6">
        <p className="text-lg font-medium text-slate-800 mb-6">{currentQuestion.question}</p>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let itemClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ";
            
            if (showResult) {
               if (idx === currentQuestion.correctAnswerIndex) {
                 itemClass += "border-green-500 bg-green-50 text-green-900";
               } else if (idx === selectedOption) {
                 itemClass += "border-red-300 bg-red-50 text-red-900";
               } else {
                 itemClass += "border-slate-100 text-slate-400 opacity-60";
               }
            } else {
               itemClass += "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                disabled={showResult}
                className={itemClass}
              >
                <span>{option}</span>
                {showResult && idx === currentQuestion.correctAnswerIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                {showResult && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <p className="text-sm text-slate-700"><span className="font-bold">Explanation:</span> {currentQuestion.explanation}</p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={nextQuestion}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
              >
                {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;