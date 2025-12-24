import { Link } from 'react-router-dom';


const SignupDetails = () => {
    // We can add state handlers here later if needed
    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted");
    };

    return (
        <div className="min-h-screen bg-[#f3f4f6] relative font-sans">
            {/* Logo - Top Left */}
            <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
                <img 
                    src="/src/assets/manovate.svg" 
                    alt="Manovate Technologies" 
                    className="h-12 w-auto object-contain"
                />
            </div>

            <div className="flex items-center justify-center min-h-screen px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-[800px] bg-white p-6 sm:p-12 shadow-sm rounded-md mt-16 sm:mt-0">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <h2 className="mb-3 text-2xl font-bold text-[#1e293b]">Let's Personalize Your CRM</h2>
                        <p className="text-[#64748b] text-[15px]">
                            Customize your CRM experience by adding your company details and preferences.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Name */}
                        <div className="space-y-2">
                            <label className="block text-[15px] font-normal text-gray-500">Company Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter your company name"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-200"
                                />
                                {/* Chevron */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Industry */}
                        <div className="space-y-2">
                            <label className="block text-[15px] font-normal text-gray-500">What Type Of Products or Services Do You Plan?</label>
                            <div className="relative">
                                <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer">
                                    <option value="" disabled selected>Select an industry</option>
                                    <option value="tech">Technology</option>
                                    <option value="finance">Finance</option>
                                    <option value="retail">Retail</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="other">Other</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Time Zone */}
                        <div className="space-y-2">
                            <label className="block text-[15px] font-normal text-gray-500">Time Zone & Currency</label>
                            <div className="relative">
                                <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer">
                                    <option value="" disabled selected>Select your time zone</option>
                                    <option value="UTC">UTC</option>
                                    <option value="EST">EST</option>
                                    <option value="PST">PST</option>
                                    <option value="IST">IST</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Company Email */}
                        <div className="space-y-2">
                            <label className="block text-[15px] font-normal text-gray-500">Your Company Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your email id"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-900 focus:outline-none focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-start gap-3 pt-2">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id="newsletter"
                                    className="w-4 h-4 border-gray-300 rounded text-blue-900 focus:ring-blue-900 cursor-pointer"
                                />
                            </div>
                            <label htmlFor="newsletter" className="text-[15px] text-gray-800 cursor-pointer select-none">
                                I'd like to receive helpful CRM tips, new feature alerts, and occasional product news
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 space-y-5">
                            <button
                                type="submit"
                                className="w-full py-3 bg-[#344873] hover:bg-[#253860] text-white font-medium rounded text-[15px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#344873]"
                            >
                                Continue
                            </button>
                            <div className="text-center">
                                <Link to="/" className="text-gray-900 text-[15px] font-medium hover:underline">
                                    Skip for now
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignupDetails;
