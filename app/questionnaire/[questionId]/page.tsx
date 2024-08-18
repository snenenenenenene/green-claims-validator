// "use client";
// import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Toaster, toast } from "react-hot-toast";
// import useStore from "@/lib/store";
// import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
// import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
// import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
// import { generateQuestionsFromChart } from "@/lib/utils";

// export default function QuestionPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { chartInstances, setCurrentQuestionnaireTab, getCurrentWeight, resetCurrentWeight } = useStore((state) => ({
//     chartInstances: state.chartInstances,
//     setCurrentQuestionnaireTab: state.setCurrentQuestionnaireTab,
//     getCurrentWeight: state.getCurrentWeight,
//     resetCurrentWeight: state.resetCurrentWeight,
//   }));

//   const [question, setQuestion] = useState<any | null>(null);
//   const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   const chartParam = searchParams.get('chart');
//   const questionParam = searchParams.get('question');
//   const claimParam = searchParams.get('claim') || "Be a hero, fly carbon zero";

//   useEffect(() => {
//     console.log("useEffect triggered - Loading question");

//     if (chartInstances.length > 0 && questionParam && !isRedirecting) {
//       loadQuestion();
//     } else {
//       console.log("Chart instances not loaded or no questionParam provided");
//     }
//   }, [chartInstances, chartParam, questionParam, router, claimParam]);

//   const loadQuestion = () => {
//     console.log("Loading question based on query parameters");

//     const currentInstance = chartInstances.find(instance => instance.name === chartParam) || chartInstances[0];

//     if (!chartParam || currentInstance.name !== chartParam) {
//       console.log("Updating chart to:", currentInstance.name);
//       setCurrentQuestionnaireTab(currentInstance.name);
//       router.replace(`/questionnaire?chart=${currentInstance.name}&claim=${encodeURIComponent(claimParam)}`);
//     }

//     const generatedQuestions = generateQuestionsFromChart(currentInstance);
//     const foundQuestion = generatedQuestions.find(q => q.id === questionParam);

//     if (foundQuestion) {
//       if (foundQuestion.skipRender) {
//         console.log("Found a weight node, skipping:", foundQuestion);
//         handleWeightNodeSkipping(generatedQuestions, foundQuestion.id);
//       } else if (foundQuestion.type === "endNode") {
//         console.log("Found an end node, handling:", foundQuestion);
//         handleEndNode(foundQuestion);
//       } else {
//         console.log("Setting found question:", foundQuestion);
//         setQuestion(foundQuestion);
//       }
//     } else {
//       console.error("Question not found, redirecting to the first valid question.");
//       handleWeightNodeSkipping(generatedQuestions, generatedQuestions[0]?.id);
//     }
//   };

//   useEffect(() => {
//     console.log("aaaaa")
//     console.log(chartParam)
//     console.log(questionParam)
//     const currentInstance = chartInstances.find(instance => instance.name === chartParam) || chartInstances[0];

//     console.log(currentInstance)
//     console.log(generateQuestionsFromChart(currentInstance))
//   }, [])

//   const handleWeightNodeSkipping = (generatedQuestions: any[], startNodeId: string) => {
//     console.log("Handling weight node skipping starting from:", startNodeId);
//     let nextNodeId = startNodeId;
//     let nextNode = generatedQuestions.find(q => q.id === nextNodeId);

//     while (nextNode && nextNode.skipRender) {
//       console.log("Skipping weight node:", nextNode);
//       nextNodeId = nextNode.connectedNodes[0]?.target;
//       nextNode = generatedQuestions.find(q => q.id === nextNodeId);
//     }

//     if (nextNode) {
//       console.log("Redirecting to first non-weight node:", nextNode.id);
//       router.replace(`/questionnaire?chart=${chartParam}&question=${nextNode.id}&claim=${encodeURIComponent(claimParam)}`);
//     } else {
//       console.error("No valid non-weight node found.");
//     }
//   };

//   const handleAnswer = (answer: string) => {
//     console.log("Answer selected:", answer);
//     setSelectedAnswer(answer);
//   };

//   const handleNextQuestion = () => {
//     if (!question || !selectedAnswer) {
//       console.error("Cannot proceed to next question, either question or answer is missing.");
//       return;
//     }

//     console.log("Handling next question for:", question);

//     const nextNodeId = determineNextNodeId(question);
//     handleNodeRedirection(nextNodeId);
//   };

//   const determineNextNodeId = (currentQuestion: any): string | null => {
//     let nextNodeId: string | null = null;

//     if (currentQuestion.type === "singleChoice" || currentQuestion.type === "yesNo") {
//       const selectedOption = currentQuestion.options?.find(
//         (option: any) => option.label === selectedAnswer
//       );

//       if (selectedOption && selectedOption.nextNodeId) {
//         nextNodeId = selectedOption.nextNodeId;
//       } else {
//         nextNodeId = currentQuestion.connectedNodes.find(node => node.handle === selectedAnswer)?.target;
//       }
//     }

//     console.log("Determined Next Node ID:", nextNodeId);
//     return nextNodeId;
//   };

//   const handleNodeRedirection = (nextNodeId: string | null) => {
//     if (!nextNodeId || isRedirecting) {
//       console.error("No valid next node found or already redirecting.");
//       return;
//     }

//     setIsRedirecting(true);
//     console.log("Handling node redirection to:", nextNodeId);

//     const currentInstance = chartInstances.find(instance => instance.name === chartParam);
//     const generatedQuestions = generateQuestionsFromChart(currentInstance);
//     let nextNode = generatedQuestions.find(q => q.id === nextNodeId);

//     while (nextNode && nextNode.skipRender) {
//       console.log("Skipping Weight Node during redirection:", nextNode);
//       nextNodeId = nextNode.connectedNodes[0]?.target;
//       nextNode = generatedQuestions.find(q => q.id === nextNodeId);
//     }

//     if (nextNode) {
//       if (nextNode.type === "endNode") {
//         console.log("Handling end node during redirection:", nextNode);
//         handleEndNode(nextNode);
//       } else {
//         console.log("Setting next question during redirection:", nextNode);
//         setQuestion(nextNode);
//         router.replace(`/questionnaire?chart=${chartParam}&question=${nextNode.id}&claim=${encodeURIComponent(claimParam)}`);
//         setIsRedirecting(false);
//       }
//     } else {
//       console.error("No valid next node found during redirection.");
//       setIsRedirecting(false);
//     }
//   };

//   const handleEndNode = (nextNode: any) => {
//     console.log("Handling end node:", nextNode);

//     if (nextNode.endType === "redirect" && nextNode.redirectTab) {
//       console.log("Redirecting to another chart:", nextNode.redirectTab);
//       const redirectInstance = chartInstances.find(instance => instance.name === nextNode.redirectTab);
//       if (redirectInstance) {
//         toast.success(`Redirected to ${nextNode.redirectTab} flow chart.`);
//         setCurrentQuestionnaireTab(redirectInstance.name);
//         const generatedQuestions = generateQuestionsFromChart(redirectInstance);
//         setQuestion(generatedQuestions[0]);
//         router.replace(`/questionnaire?chart=${redirectInstance.name}&question=${generatedQuestions[0].id}&claim=${encodeURIComponent(claimParam)}`);
//       } else {
//         toast.error("Redirect tab not found.");
//         console.error("Failed to find redirect tab:", nextNode.redirectTab);
//       }
//     } else {
//       toast.success("Questionnaire completed!");
//       router.push(`/questionnaire/results?weight=${getCurrentWeight()}`);
//     }

//     setIsRedirecting(false);
//   };

//   const renderQuestion = () => {
//     if (!question) {
//       console.error("No question available to render.");
//       return null;
//     }

//     console.log("Rendering Question:", question);

//     switch (question?.type) {
//       case "yesNo":
//         return <YesNoQuestion question={question.question} onAnswer={handleAnswer} />;
//       case "singleChoice":
//         return (
//           <SingleChoiceQuestion question={question.question} options={question.options} onAnswer={handleAnswer} />
//         );
//       case "multipleChoice":
//         return (
//           <MultipleChoiceQuestion question={question.question} options={question.options} onAnswer={handleAnswer as any} />
//         );
//       default:
//         console.error("Unknown question type:", question?.type);
//         return null;
//     }
//   };

//   return (
//     <div className="flex h-screen w-full flex-col justify-between px-10 lg:px-20 xl:px-28 text-dark-gray">
//       <div className="my-6 flex justify-center font-roboto text-3xl">
//         <p>{claimParam}</p>
//       </div>
//       <div className="w-full px-8 pb-4">
//         <div className="relative h-12 w-full rounded-full bg-gray-200 p-2 dark:bg-gray-700">
//           <div className="h-full rounded-full bg-green transition-all duration-500 ease-in-out dark:bg-green">
//             {/* Progress Indicator */}
//           </div>
//         </div>
//       </div>
//       <div className="mx-8 my-4 mb-auto flex min-h-[30%] flex-col rounded-3xl bg-light-gray p-8">
//         {renderQuestion()}
//         <button
//           type="button"
//           className={`hover:bg-green-800 focus:ring-green-300 mt-auto w-40 rounded-full bg-green px-10 py-2.5 text-white focus:outline-none focus:ring-4 ${!selectedAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
//           onClick={handleNextQuestion}
//           disabled={!selectedAnswer}
//         >
//           Volgende
//         </button>
//       </div>
//       <Toaster />
//     </div>
//   );
// }
