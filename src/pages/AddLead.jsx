import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Dropdown from "../components/common/Dropdown";
import { saveLead } from "../utils/leadsStorage";

const AddLead = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    jobTitle: "",
    email: "",
    status: "New",
    website: "",
    value: "",
    platform: "Linkedin",
    createdOn:
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " - " +
      new Date().toLocaleDateString("en-US", { weekday: "short" }),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveLead({
      name: `${formData.firstName} ${formData.lastName}`,
      ...formData,
    });
    navigate("/leads");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/leads")}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-2"
        >
          <ChevronLeft size={16} /> Back to Leads
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add New Person</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required
            />
            <InputGroup
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required
            />
          </div>

          <InputGroup
            id="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john.doe@company.com"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="company"
              label="Company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Acme Inc."
              required
            />
            <InputGroup
              id="jobTitle"
              label="Job Title"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Sales Manager"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="website"
              label="Website URL"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
            <InputGroup
              id="value"
              label="Lead Value (Income)"
              value={formData.value}
              onChange={handleChange}
              placeholder="50,00,000"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              label="Lead Source"
              options={[
                "Linkedin",
                "Twitter",
                "Facebook",
                "Website",
                "Referral",
                "Other",
              ]}
              value={formData.platform}
              onChange={(val) =>
                handleChange({ target: { name: "platform", value: val } })
              }
            />
            <InputGroup
              id="createdOn"
              label="Created On"
              value={formData.createdOn}
              disabled
            />
          </div>

          <Dropdown
            label="Status"
            options={["New", "Opened", "Interested", "Rejected"]}
            value={formData.status}
            onChange={(val) =>
              handleChange({ target: { name: "status", value: val } })
            }
          />

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#344873] text-white rounded-lg text-sm font-medium hover:bg-[#253860] transition-colors"
            >
              Save Person
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ id, label, type = "text", ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
        props.disabled ? "bg-gray-50 text-gray-500" : ""
      }`}
      {...props}
    />
  </div>
);

export default AddLead;
