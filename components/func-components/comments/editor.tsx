type Feedback = {
    open: boolean;
    feedback: string;
}
export const Editor = ({ feedback }: Feedback) => {
    return (
        <div>
            <h1>Editor</h1>
        </div>
    )
}

/*
({ feedback, handleFeedbackKeyDown, handleFeedbackSubmit, feedbackTextareaRef, isLoading, openMyChats }) => {
{feedback.open && (
    <div className={`mt-2 ${feedback.feedback ? 'opacity-50' : ''}`}>
        <div className="relative">
            <textarea
                onKeyDown={handleFeedbackKeyDown}
                ref={feedbackTextareaRef}
                defaultValue={feedback.feedback || ''}
                // onChange={(e) => { lastMessage.feedback = e.target.value }}
                placeholder="Your feedback..."
                //className="w-full p-3 pr-16 border rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-black resize-none"
                className={`w-full p-3 pr-16 border mh-4 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-black resize-none ${openMyChats ? 'opacity-50' : ''}`}

                rows={3}
                disabled={isLoading || feedback.feedback}
            />
            <button
                onClick={handleFeedbackSubmit}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-600 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
                <FaPaperPlane size={18} />
            </button>
        </div>
    </div>
)}*/