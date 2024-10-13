// components/func-components/application-form.tsx
'use client';
import React, { useState } from 'react';
import { actionUpsertCidApp } from '@/lib/fetchers/cid-applications';

interface ApplicationFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    email: string;
    url: string;
    note: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onCancel, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        url: '',
        note: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const validateUrl = (url: string) => {
        // Basic URL format check
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!validateUrl(formData.url)) {
            setError('Please enter a valid URL');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await actionUpsertCidApp(formData);
            if (result.success) {
                onSuccess();
            } else {
                setError(result.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Apply for Revenue-Sharing Program</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <fieldset disabled={isSubmitting}>
                <div className="mb-4">
                    <label htmlFor="name" className="block mb-2">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="url" className="block mb-2">Website URL</label>
                    <input
                        type="url"
                        id="url"
                        name="url"
                        value={formData.url}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="note" className="block mb-2">Additional Notes</label>
                    <textarea
                        id="note"
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows={4}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    ></textarea>
                </div>
            </fieldset>
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        'Submit Application'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ApplicationForm;
