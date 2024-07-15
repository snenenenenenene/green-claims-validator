import Question from "@/components/questionnaire/question"

import { Questions } from "@/app/data";

export default async function QuestionnairePage() {

    // We need a card for containing questions 
    // And a link to go to the next question
    return ( 
        <div className="h-full w-full justify-center bg-emerald-100 m-8 rounded-lg text-green">
            {Questions.map(q => (
                <Question question={q} />
            ))}
        </div>
    )
}
