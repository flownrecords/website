import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
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
        text: "Aircraft Specific",
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
    {
        id: 3,
        text: "C152",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#916530]/25",
            ring: "ring-[#916530]"
        }
    },
    {
        id: 4,
        text: "P06T",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#309138]/25",
            ring: "ring-[#309138]"
        }
    },
    {
        id: 5,
        text: "POF",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#573091]/25",
            ring: "ring-[#573091]"
        }
    },
    {
        id: 6,
        text: "Air Law",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#b51583]/25",
            ring: "ring-[#b51583]"
        }
    },
    {
        id: 7,
        text: "Meteorology",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#309174]/25",
            ring: "ring-[#309174]"
        }
    },
    {
        id: 8,
        text: "Performance",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#303a91]/25",
            ring: "ring-[#303a91]"
        }
    },
    {
        id: 9,
        text: "AGK",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#6469fa]/25",
            ring: "ring-[#6469fa]"
        }
    },
    {
        id: 10,
        text: "Radio Navigation",
        colorScheme: {
            text: "text-white",
            bg: "bg-[#9e2c3b]/25",
            ring: "ring-[#9e2c3b]"
        }
    },
]

const questions = [
    {
        id: 1,
        authorId: 1,
        question: "What is the maximum takeoff weight of a C172?",
        answer: "The maximum takeoff weight of a C172 is 2550 lbs.",
        viewCount: 6,
        upVoteCount: 0,
        tags: [2]
    },
    {
        id: 2,
        authorId: 1,
        question: "What is the stall speed of a C152?",
        answer: "The stall speed of a C152 is approximately 47 knots.",
        viewCount: 5,
        upVoteCount: 0,
        tags: [3]
    },
    {
        id: 3,
        authorId: 1,
        question: "What is the fuel capacity of a C172?",
        answer: "The fuel capacity of a C172 is 56 gallons.",
        viewCount: 12,
        upVoteCount: 0,
        tags: [2]
    },
    {
        id: 4,
        authorId: 1,
        question: "What is the maximum speed of a C152?",
        answer: "The maximum speed of a C152 is approximately 107 knots.",
        viewCount: 123,
        upVoteCount: 0,
        tags: [3]
    },
    {
        id: 5,
        authorId: 1,
        question: "What is the climb rate of a C172?",
        answer: "The climb rate of a C172 is approximately 730 feet per minute.",
        viewCount: 8,
        upVoteCount: 0,
        tags: [2]
    }
]

export default function Questions() {
    const { user } = useAuth();

    const [ questionModal, setQuestionModal ] = useState(false);
    const [ selectedTags, editSelectedTags ] = useState<TagID[]>([]);
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ pubQuestionTags, editPubQuestionTags] = useState<TagID[]>([]);
    const [ sortByPop, setSortByPop ] = useState<0 | 1 | 2>(0);

    const lowerSearch = searchQuery.toLowerCase().trim();
    const hasQuery = lowerSearch.length > 0;
    const hasTags = selectedTags.length > 0;

    function getRelevanceScore(q: Question): number {
    let score = 0;

    if (hasQuery) {
        if (q.question.toLowerCase().includes(lowerSearch)) score += 5;
        if (q.answer.toLowerCase().includes(lowerSearch)) score += 3;
        if (q.question.toLowerCase().startsWith(lowerSearch)) score += 2;
    }

    if (hasTags) {
        const tagMatches = q.tags.filter(tag => selectedTags.includes(tag as TagID)).length;
        score += tagMatches * 2;
    }

    return score;
    }

    const allQuestions = questions
    .map(q => ({ ...q, score: getRelevanceScore(q) }))
    .filter(q => q.score > 0 || (!hasQuery && !hasTags)) 
    .sort((a, b) => {
        if (sortByPop === 0) return 0;
        if (sortByPop === 1) return b.viewCount - a.viewCount;
        if (sortByPop === 2) return a.viewCount - b.viewCount;
        return 0;
    })
    .sort((a, b) => b.score - a.score);

    return (
        <>
            <Splash uppertext="Flight & Tests preparation" title="Questions"/>
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


                    { allQuestions.length > 0 ? (
                        <div className="col-span-4 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg" id="all-questions">
                            <div className="grid grid-cols-9">
                                <h2 className="col-span-6 font-semibold text-white/75 mb-2">
                                {
                                    hasQuery 
                                    ? `Search results for "${searchQuery}"` 
                                    : hasTags 
                                    ? `Questions with selected tags` 
                                    : `All Questions`
                                }
                                </h2>
                                <div 
                                className="col-span-2 text-center text-sm cursor-pointer text-white/75 decoration-accent decoration-2 hover:underline hover:text-white/50 transition-all duration-300" 
                                onClick={() => {
                                    if (sortByPop === 0) {
                                        setSortByPop(1);
                                    } else if (sortByPop === 1) {
                                        setSortByPop(2);
                                    } else {
                                        setSortByPop(0);
                                    }
                                }}>
                                    Sort by popularity 
                                    {
                                        sortByPop === 0 &&  <Minus className="h-5 w-5 inline cursor-pointer"/>
                                    }
                                    {
                                        sortByPop === 1 &&  <ChevronDown className="h-5 w-5 inline cursor-pointer"/>
                                    }
                                    {
                                        sortByPop === 2 &&  <ChevronUp className="h-5 w-5 inline cursor-pointer"/>
                                    }
                                </div>
                            </div>
                            {
                                allQuestions
                                .map((q, i) => {
                                    return (
                                        <QuestionBlock question={q} index={i} tags={tags}/>
                                    )
                                })
                            }
                        </div> 
                        ) : (
                            <div className="col-span-4 lg:col-span-3 p-4 ring-2 ring-white/25 rounded-lg" id="all-questions">
                                <h2 className="font-semibold text-white/75 mb-2">
                                    {
                                        hasQuery 
                                        ? `No results found for "${searchQuery}"` 
                                        : hasTags 
                                        ? `No questions found with selected tags` 
                                        : `No questions available`
                                    }
                                </h2>
                            </div>
                        )
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