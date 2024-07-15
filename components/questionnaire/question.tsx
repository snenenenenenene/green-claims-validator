
'use client'

import OptionList from "./option-list"

export default function Question(props:any ) {
  return (
    <div className="question m-8">
        <div className="questionText p-3">
            <h3 className="text-xl">{props.question.text}</h3>
        </div>

        <hr className="border-black"/>

        <OptionList options={props.question.options} />
    </div>
  )
}
