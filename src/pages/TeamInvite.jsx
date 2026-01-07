import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from '../components/common/Dropdown';

const TeamInvite = () => {
    const navigate = useNavigate();
    const [invites, setInvites] = useState([{ email: '', role: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddInvite = () => {
        setInvites([...invites, { email: '', role: '' }]);
    };

    const handleEmailChange = (index, value) => {
        const newInvites = [...invites];
        newInvites[index].email = value;
        setInvites(newInvites);
    };

    const handleRoleChange = (index, value) => {
        const newInvites = [...invites];
        newInvites[index].role = value;
        setInvites(newInvites);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        const isValid = invites.every(invite => invite.email.trim() !== '' && invite.role !== '');
        if (!isValid) {
            alert("Please fill in all email and role fields.");
            return;
        }

        setIsSubmitting(true);
        // Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Invites submitted:", invites);
        alert("Invitations sent successfully!");
        
        setIsSubmitting(false);
        navigate('/dashboard'); 
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
                        <h2 className="mb-3 text-2xl font-bold text-[#1e293b]">Invite Your Team Members</h2>
                        <p className="text-[#64748b] text-[15px]">
                            Get your projects up and running faster by directly inviting your team member to your projects
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {invites.map((invite, index) => (
                            <div key={index} className="space-y-4">
                                {/* Email Address */}
                                <div className="space-y-2">
                                    <label className="block text-[15px] font-normal text-gray-500">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="e.g name@domain.com"
                                        value={invite.email}
                                        onChange={(e) => handleEmailChange(index, e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all duration-200"
                                    />
                                </div>

                                {/* Role */}
                                <Dropdown
                                    label="Role"
                                    options={['Admin', 'Member', 'Viewer']}
                                    value={invite.role}
                                    onChange={(val) => handleRoleChange(index, val)}
                                    placeholder="Select Role"
                                />
                            </div>
                        ))}

                        {/* Add New Button */}
                        <button
                            type="button"
                            onClick={handleAddInvite}
                            className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded text-[15px] hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                        >
                            +Add new
                        </button>

                        {/* Send Invitations Button */}
                        <div className="pt-4 space-y-5">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 bg-[#344873] hover:bg-[#253860] text-white font-medium rounded text-[15px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#344873] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Sending...' : 'Send Invitations'}
                            </button>
                            <div className="text-center">
                                <Link to="/dashboard" className="text-gray-900 text-[15px] font-medium hover:underline">
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

export default TeamInvite;
