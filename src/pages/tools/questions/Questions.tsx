import { Minus, Plus } from "lucide-react";
import Button from "../../../components/general/Button";
import Splash from "../../../components/general/Splash";
import QuestionBlock from "../../../components/questions/QuestionBlock";
import Footer from "../../../components/general/Footer";
import { useState } from "react";
import type { Question, TagID } from "../../../lib/types";
import { useAuth } from "../../../components/auth/AuthContext";

const tags = [
    {
        id: 1,
        text: "C152",
        colorScheme: {
            text: "text-white",
            bg: "bg-accent/25",
            ring: "ring-accent"
        }
    },
    {
        id: 2,
        text: "C172",
        colorScheme: {
            text: "text-white",
            bg: "bg-second-accent/25",
            ring: "ring-second-accent"
        }
    },
]

const questions = [
    {
        id: 1,
        authorId: 1,
        question: "What is the capital of France?",
        answer: "",
        viewCount: 1000,
        upVoteCount: 50,
        tags: [2]
    },
    {
        id: 2,
        authorId: 1,
        question: "What is the capital of Germany?",
        answer: "",
        viewCount: 800,
        upVoteCount: 30,
        tags: [1]
    },
    {
        id: 3,
        authorId: 1,
        question: "What is the capital of Spain?",
        answer: "",
        viewCount: 600,
        upVoteCount: 20,
        tags: [1]
    },
    {
        id: 4,
        authorId: 1,
        question: "What is the capital of Italy?",
        answer: "",
        viewCount: 400,
        upVoteCount: 10,
        tags: [1]
    },
    {
        id: 5,
        authorId: 1,
        question: "What is the capital of Portugal?",
        answer: "",
        viewCount: 200,
        upVoteCount: 5,
        tags: [1]
    },
    {
        id: 6,
        authorId: 1,
        question: "What is the capital of Netherlands?",
        answer: "",
        viewCount: 150,
        upVoteCount: 3,
        tags: [1,2]
    }
]

export default function Questions() {

    const { user } = useAuth();

    const [ questionModal, setQuestionModal ] = useState(false);
    const [ selectedTags, editSelectedTags ] = useState<TagID[]>([]);
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ pubQuestionTags, editPubQuestionTags] = useState<TagID[]>([]);

    const lowerSearch = searchQuery.toLowerCase();
    const hasQuery = lowerSearch.trim().length > 0;
    const hasTags = selectedTags.length > 0;

    const matchesTags = (q: Question) =>
    !hasTags || q.tags.some(tag => selectedTags.includes(tag as TagID));

    const matchesSearch = (q: Question) =>
    !hasQuery || (
        q.question.toLowerCase().includes(lowerSearch) ||
        q.answer.toLowerCase().includes(lowerSearch)
    );

    const mostPopularQuestions = questions
    .filter(q =>
        (!hasTags && !hasQuery) || (matchesTags(q) && matchesSearch(q))
    )
    .sort((a, b) => b.upVoteCount - a.upVoteCount || b.viewCount - a.viewCount)
    .slice(0, 5);

    const allQuestions = questions
    .filter(q =>
        (!hasTags && !hasQuery) || (matchesTags(q) && matchesSearch(q))
    )
    .filter(q => !mostPopularQuestions.some(mq => mq.id === q.id))
    .sort((a, b) => b.viewCount - a.viewCount || b.upVoteCount - a.upVoteCount);

    const searchResults = questions
    .filter(q =>
        (!hasTags && !hasQuery) || (matchesTags(q) && matchesSearch(q))
    )
    .sort((a, b) => b.viewCount - a.viewCount || b.upVoteCount - a.upVoteCount);

    return (
        <>
            <Splash uppertext="Flight & Tests preparation" title="Question Database"/>
            <div className="container mx-auto max-w-6xl p-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                    <div className="col-span-4 p-4 ring-2 ring-white/25 rounded-lg block lg:hidden">
                        <h2 className="font-semibold text-white/75 mb-2">Filters</h2>
                        <div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <h3 className="font-semibold text-white/50 text-sm">Tags</h3>
                                {
                                    tags.map(tag => (
                                        <span 
                                        key={tag.id} 
                                        onClick={() => {
                                            if (selectedTags.includes(tag.id)) {
                                                editSelectedTags(selectedTags.filter(t => t !== tag.id));
                                            } else {
                                                editSelectedTags([...selectedTags, tag.id]);
                                            }
                                        }} 
                                        className={`
                                        ${tag.colorScheme?.text} ${tag.colorScheme?.bg} ${tag.colorScheme?.ring} 
                                        ${selectedTags.includes(tag.id) ? 'opacity-100' : 'opacity-75'}
                                        text-xs ring-1 py-0.5 px-2 rounded-xl inline-flex items-center justify-center cursor-pointer`}>
                                            {tag.text} 
                                            {
                                                selectedTags.includes(tag.id) 
                                                ? <Minus 
                                                    className="h-3 w-3 ml-1" 
                                                    
                                                  />
                                                : <Plus 
                                                    className="h-3 w-3 ml-1" 
                                                  />
                                            }
                                        </span>
                                    ))
                                    
                                }
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white/50 text-sm mt-4">Search</h3>
                            <input 
                                type="text" 
                                placeholder="Search questions..." 
                                className="bg-primary/5 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full mt-2 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-3">

                        </div>
                    </div>

                    { searchQuery.length > 0 && 
                        <div className="col-span-4 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg">
                            <h2 className="font-semibold text-white/75 mb-2">Search Query</h2>
                            {
                                searchResults.length === 0 
                                ? 
                                <div>
                                    <p className="text-white/50">
                                        No results found for "{searchQuery}" { selectedTags.length > 0 ? `using tags: ${selectedTags.map(t => tags.find(tag => tag.id === t)?.text).join(', ')}` : '' }
                                    </p>
                                </div>
                                : searchResults.map((q, i) => {
                                    return (
                                        <QuestionBlock question={q} index={i} tags={tags}/>
                                    )
                                })
                            }
                        </div> 
                    }

                    { searchQuery.length === 0 && mostPopularQuestions.length > 0 && 
                        <div className="col-span-4 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg">
                        <h2 className="font-semibold text-white/75 mb-2">Most Popular Questions</h2>

                        {
                            mostPopularQuestions
                            .map((q, i) => {
                                return (
                                    <QuestionBlock question={q} index={i} tags={tags}/>
                                )
                            })
                        }
                        </div> 
                    }

                    <div className="col-span-1 p-4 ring-2 ring-white/25 rounded-lg hidden lg:block">
                        <h2 className="font-semibold text-white/75 mb-2">Filters</h2>
                        <div>
                            <h3 className="font-semibold text-white/50 text-sm">Tags</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {
                                    tags.map(tag => (
                                        <span 
                                        key={tag.id} 
                                        onClick={() => {
                                            if (selectedTags.includes(tag.id)) {
                                                editSelectedTags(selectedTags.filter(t => t !== tag.id));
                                            } else {
                                                editSelectedTags([...selectedTags, tag.id]);
                                            }
                                        }} 
                                        className={`
                                        ${tag.colorScheme?.text} ${tag.colorScheme?.bg} ${tag.colorScheme?.ring} 
                                        ${selectedTags.includes(tag.id) ? 'opacity-100' : 'opacity-75'}
                                        text-xs ring-1 py-0.5 px-2 rounded-xl inline-flex items-center justify-center cursor-pointer`}>
                                            {tag.text} 
                                            {
                                                selectedTags.includes(tag.id) 
                                                ? <Minus 
                                                    className="h-3 w-3 ml-1" 
                                                    
                                                  />
                                                : <Plus 
                                                    className="h-3 w-3 ml-1" 
                                                  />
                                            }
                                        </span>
                                    ))
                                    
                                }
                            </div>

                        </div>

                        <div>
                            <h3 className="font-semibold text-white/50 text-sm mt-4">Search</h3>
                            <input 
                                type="text" 
                                placeholder="Search questions..." 
                                className="bg-primary/5 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50 w-full mt-2 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div>
                            <h3 className="font-semibold text-white/50 text-sm mt-4">Options</h3>
                            <div className="flex flex-col gap-4 mt-2">
                                <Button 
                                    text="Reset filters" 
                                    styleType="small"
                                    onClick={() => {
                                        editSelectedTags([]);
                                        setSearchQuery('');
                                    }} 
                                    className="w-full"
                                />

                                {
                                    user?.permissions?.includes('ADMIN') && 
                                    <Button 
                                        text="Add Question" 
                                        styleType="small"
                                        className="w-full"
                                        onClick={() => setQuestionModal(!questionModal)}
                                    />
                                }

                                {
                                    user?.permissions?.includes('ADMIN') && 
                                    <Button 
                                        text="Manage" 
                                        styleType="small"
                                        className="w-full"
                                        to="/q/manage"
                                    />
                                }
                            </div>
                        </div>

                    </div>

                    { searchQuery.length === 0 && allQuestions.length > 0 && 
                        <div className="col-span-4 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg" id="all-questions">
                            <h2 className="font-semibold text-white/75 mb-2">All questions</h2>
                            {
                                allQuestions
                                .map((q, i) => {
                                    return (
                                        <QuestionBlock question={q} index={i} tags={tags}/>
                                    )
                                })
                            }
                        </div> 
                    }
                </div>
            </div>
            <Footer/>

            { questionModal && (
                <div className="fixed inset-0 bg-black/50 z-3000 flex items-center justify-center">
                    <div className="bg-secondary p-4 rounded-lg w-128">
                        <h2 className="text-xl font-semibold mb-4">Publish a new question</h2>
                        <ul>
                            
                        </ul>

                        <div className="flex flex-col">
                            <label className="text-sm text-white/75 mb-1">Question</label>
                            <input
                                className="bg-primary/5 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                
                                type="text"
                            />

                            <label className="text-sm text-white/75 mb-1 mt-4">Answer</label>
                            <input
                                className="bg-primary/5 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50"
                                
                                type="text"
                            />

                            <label className="text-sm text-white/75 mb-1 mt-4">Tags</label>
                            <div className="bg-primary/5 ring-2 ring-white/25 rounded-lg px-4 py-2 focus:outline-none focus:ring-white/50">
                                <div className="flex flex-wrap gap-2">
                                {
                                    tags.map(tag => (
                                        <span 
                                        key={tag.id} 
                                        onClick={() => {
                                            if (pubQuestionTags.includes(tag.id)) {
                                                editPubQuestionTags(pubQuestionTags.filter(t => t !== tag.id));
                                            } else {
                                                editPubQuestionTags([...pubQuestionTags, tag.id]);
                                            }
                                        }} 
                                        className={`
                                        ${tag.colorScheme?.text} ${tag.colorScheme?.bg} ${tag.colorScheme?.ring} 
                                        ${pubQuestionTags.includes(tag.id) ? 'opacity-100' : 'opacity-75'}
                                        text-xs ring-1 py-0.5 px-2 rounded-xl inline-flex items-center justify-center cursor-pointer`}>
                                            {tag.text} 
                                            {
                                                pubQuestionTags.includes(tag.id) 
                                                ? <Minus className="h-3 w-3 ml-1"/>
                                                : <Plus className="h-3 w-3 ml-1"/>
                                            }
                                        </span>
                                    ))
                                    
                                }
                            </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button text='Publish' styleType='small' type='button' className='mt-4' onClick={() => {}}/>
                                <Button text='Close' styleType='small' type='button' className='mt-4' onClick={() => {
                                    setQuestionModal(false);
                                }}/>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}