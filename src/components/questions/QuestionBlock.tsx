import { ArrowUp, Eye } from "lucide-react";
import Button from "../general/Button";

import { type Question, type QuestionTag } from "../../lib/types";
import { Link } from "react-router-dom";
export default function QuestionBlock({
    question,
    index,
    tags,
}: {
    question: Question;
    index: number;
    tags: QuestionTag[];
}) {
    return (
        <>
            <Link to={`/q/${question.id}`}>
                <div
                    key={question.id}
                    className={`
                    grid grid-cols-9 py-4 px-2 items-center transition-all duration-150 rounded-lg cursor-pointer
                    ${index % 2 === 0 ? "bg-gradient-to-br to-neutral-900 from-neutral-800 hover:from-neutral-800/75" : "bg-primary hover:bg-primary/75"} 
                `}
                >
                    <div className="col-span-8 lg:col-span-6">
                        <h1 className="font-semibold">{question.question}</h1>
                        <div className="space-x-2">
                            {tags
                                .filter(
                                    (tag) =>
                                        question.tags.includes(tag.id) ||
                                        (question.tags as (number | string)[]).includes(tag.text),
                                )
                                .map((tag) => (
                                    <span
                                        key={tag.id}
                                        className={`${tag.colorScheme?.text} ${tag.colorScheme?.bg} ${tag.colorScheme?.ring} text-xs ring-1 py-0.5 px-2 rounded-xl`}
                                    >
                                        {tag.text}
                                    </span>
                                ))}
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center justify-center space-x-1 text-white/25 text-sm mr-2">
                        <ArrowUp strokeWidth={1.25} className="h-5 w-5" />
                        <span>{question.upVoteCount}</span>
                    </div>
                    <div className="hidden lg:flex items-center justify-center space-x-1 text-white/25 text-sm mr-2">
                        <Eye strokeWidth={1.25} className="h-5 w-5" />
                        <span className="">{question.viewCount}</span>
                    </div>
                    <div className="hidden lg:block">
                        <Button text="View" styleType="small" />
                    </div>
                </div>
            </Link>
        </>
    );
}
