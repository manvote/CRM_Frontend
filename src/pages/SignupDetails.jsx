import { useState } from 'react';
import { Link } from 'react-router-dom';

const SignupDetails = () => {
    // We can add state handlers here later if needed
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted");
    };

    return (
        <div className="w-full max-w-lg mx-auto animate-fade-in-up">
            {/* Header */}
            <div className="mb-10 text-center">
                <h2 className="mb-3 text-2xl font-bold text-gray-900">Let's Personalize Your CRM</h2>
                <p className="text-gray-500 text-slate-500">
                    Customize your CRM experience by adding your company details and preferences.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Company Name</label>
                    <input
                        type="text"
                        placeholder="Enter your company name"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                </div>

                {/* Industry */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">What Type Of Products or Services Do You Plan?</label>
                    <div className="relative">
                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer">
                            <option value="" disabled selected>Select an industry</option>
                            <option value="tech">Technology</option>
                            <option value="finance">Finance</option>
                            <option value="retail">Retail</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Time Zone */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Time Zone & Currency</label>
                    <div className="relative">
                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer">
                            <option value="" disabled selected>Select your time zone</option>
                            <option value="UTC">UTC</option>
                            <option value="EST">EST</option>
                            <option value="PST">PST</option>
                            <option value="IST">IST</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Company Email */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-400">Your Company Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email id"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                </div>

                {/* Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                    <div className="flex items-center h-5">
                        <input
                            type="checkbox"
                            id="newsletter"
                            className="w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                    </div>
                    <label htmlFor="newsletter" className="text-base text-gray-900 cursor-pointer select-none">
                        I'd like to receive helpful CRM tips, new feature alerts, and occasional product news
                    </label>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-4">
                    <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#344054] hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-gray-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                        Continue
                    </button>
                    <div className="text-center">
                        <Link to="/" className="text-gray-900 text-base font-medium hover:underline">
                            Skip for now
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SignupDetails;
