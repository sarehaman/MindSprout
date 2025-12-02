import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Share2, 
  BrainCircuit, 
  Sparkles, 
  Map as MapIcon, 
  HelpCircle,
  ArrowRight,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { fetchConceptOverview, fetchConceptMap, fetchQuiz } from './services/gemini';
import { ConceptData, ConceptGraphData, QuizQuestion, ViewState, DifficultyLevel } from './types';
import ConceptGraph from './components/ConceptGraph';
import Quiz from './components/Quiz';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);
  const [topic, setTopic] = useState('');
  const [conceptData, setConceptData] = useState<ConceptData | null>(null);
  const [graphData, setGraphData] = useState<ConceptGraphData | null>(null);
  const [quizData, setQuizData] = useState<QuizQuestion[] | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [loadingStep, setLoadingStep] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setViewState(ViewState.LOADING);
    setLoadingStep('Analyzing concept...');

    try {
      // Parallelize fetching for speed where possible, but dependent data needs care.
      // We'll fetch overview first to ensure valid topic.
      const overview = await fetchConceptOverview(topic);
      setConceptData(overview);
      
      setLoadingStep('Mapping connections...');
      const map = await fetchConceptMap(topic);
      setGraphData(map);

      setLoadingStep('Generating knowledge check...');
      const quiz = await fetchQuiz(topic, 'beginner');
      setQuizData(quiz);

      setViewState(ViewState.DASHBOARD);
    } catch (error) {
      console.error(error);
      setViewState(ViewState.ERROR);
    }
  };

  const handleDifficultyChange = async (newDifficulty: DifficultyLevel) => {
    if (difficulty === newDifficulty) return;
    setDifficulty(newDifficulty);
    
    // Refresh quiz if difficulty changes
    if (topic) {
        // We only show a loading indicator for the quiz section if we wanted to be granular,
        // but for simplicity, we keep the quiz loaded until new data arrives or use a local loading state.
        // For this demo, let's just fetch it silently and update.
        try {
            const newQuiz = await fetchQuiz(topic, newDifficulty);
            setQuizData(newQuiz);
        } catch (e) {
            console.error("Failed to update quiz difficulty");
        }
    }
  };

  const handleNodeClick = (nodeId: string) => {
     // A fun feature: clicking a node updates the search!
     if (viewState === ViewState.DASHBOARD) {
         setTopic(nodeId);
         // Automatically trigger search - we need to extract the search logic or use a useEffect
         // For simplicity in this demo, we'll just set the topic and let user click 'Explore' or 
         // we could trigger it. Let's trigger it.
         // Note: We can't easily call handleSearch directly due to event object. 
         // So we will just update the input and scroll to top.
         window.scrollTo({ top: 0, behavior: 'smooth' });
     }
  };

  const renderContent = () => {
    switch (viewState) {
      case ViewState.IDLE:
        return (
          <div className="max-w-3xl mx-auto text-center mt-20 px-4">
            <div className="bg-indigo-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 transform rotate-3">
              <BrainCircuit className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Master any concept with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">MindSprout</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              An adaptive learning platform powered by Gemini. Enter any topic to generate interactive concept maps, personalized explanations, and instant quizzes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto mt-16">
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Instant Explanations</h3>
                <p className="text-slate-500 text-sm">Get clear, structured breakdowns tailored to your expertise level.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <MapIcon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Visual Mapping</h3>
                <p className="text-slate-500 text-sm">Explore interactive knowledge graphs to see how ideas connect.</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Adaptive Quizzes</h3>
                <p className="text-slate-500 text-sm">Test your understanding immediately with AI-generated questions.</p>
              </div>
            </div>
          </div>
        );

      case ViewState.LOADING:
        return (
          <div className="max-w-2xl mx-auto mt-32 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
               <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">{loadingStep}</h3>
            <p className="text-slate-500">Constructing your personalized learning path...</p>
          </div>
        );

      case ViewState.ERROR:
        return (
          <div className="max-w-lg mx-auto mt-32 text-center">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h3>
            <p className="text-slate-500 mb-8">We couldn't generate the content for that topic. It might be too obscure or sensitive.</p>
            <button 
              onClick={() => setViewState(ViewState.IDLE)}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        );

      case ViewState.DASHBOARD:
        if (!conceptData || !graphData || !quizData) return null;

        return (
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Learning Path</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 capitalize">{conceptData.topic}</h1>
              </div>
              <div className="flex gap-2">
                 <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Share">
                   <Share2 className="w-5 h-5" />
                 </button>
                 <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Save">
                   <BookOpen className="w-5 h-5" />
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Summary Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                    Core Concept
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-lg mb-6">{conceptData.summary}</p>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                     <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Real World Analogy</span>
                     <p className="text-slate-700 italic">"{conceptData.realWorldAnalogy}"</p>
                  </div>
                </div>

                {/* Detailed Explanation with Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="flex border-b border-slate-200">
                    <button 
                      onClick={() => handleDifficultyChange('beginner')}
                      className={`flex-1 py-4 text-sm font-medium transition-colors ${difficulty === 'beginner' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                    >
                      Beginner Explanation
                    </button>
                    <button 
                      onClick={() => handleDifficultyChange('advanced')}
                      className={`flex-1 py-4 text-sm font-medium transition-colors ${difficulty === 'advanced' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}
                    >
                      Advanced Deep Dive
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 leading-7">
                        {difficulty === 'beginner' ? conceptData.beginnerExplanation : conceptData.advancedExplanation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md">
                   <h3 className="font-semibold text-indigo-200 mb-4 uppercase text-sm tracking-wider">Key Takeaways</h3>
                   <ul className="space-y-3">
                     {conceptData.keyTakeaways.map((point, idx) => (
                       <li key={idx} className="flex items-start">
                         <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                         <span className="text-indigo-50 leading-relaxed">{point}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              </div>

              {/* Sidebar / Tools Column */}
              <div className="space-y-8">
                {/* Concept Map */}
                <div className="flex flex-col gap-2">
                   <ConceptGraph data={graphData} onNodeClick={handleNodeClick} />
                   <p className="text-xs text-slate-500 text-center">Click a node to explore that concept</p>
                </div>

                {/* Quiz */}
                <Quiz questions={quizData} onReset={() => setTopic('')} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setViewState(ViewState.IDLE)}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">MindSprout</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 md:mx-8">
            <div className="relative group">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What do you want to learn?"
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-full text-slate-900 placeholder-slate-500 transition-all outline-none"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
            </div>
          </form>

          <div className="flex items-center gap-4">
             <button className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
               <GraduationCap className="w-4 h-4" />
               My Learning
             </button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer">
               JD
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 MindSprout. Powered by Google Gemini.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;