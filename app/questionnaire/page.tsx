import Question from "@/components/questionnaire/question"

import { Questions } from "@/app/data";

export default async function QuestionnairePage() {

    // We need a card for containing questions 
    // And a link to go to the next question
    return ( 
        <div className="mt-6 px-60 flex flex-col h-full w-full overflow-y-scroll text-dark-gray">
            <div className="flex justify-center text-3xl font-roboto">
                <p>Be a hero, fly carbon zero</p>
            </div>
            <div className="mx-0.2 bg-light-gray m-8 rounded-3xl ">
                {Questions.map((q, index) => (
                    <Question key={index} question={q} />
                ))}

            </div>
            <button type="button" className="flex-initial w-32 mb-12 mx-12 px-10 text-white bg-green hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Volgende</button>
        </div>
    )
}
