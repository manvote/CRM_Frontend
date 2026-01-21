import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
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
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    createdOn:
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }) +
      " - " +
      new Date().toLocaleDateString("en-US", { weekday: "short" }),
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Validation Rules
  const validate = (data) => {
    const newErrors = {};

    if (!data.firstName.trim()) newErrors.firstName = "First name is required";
    if (!data.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!data.company.trim()) newErrors.company = "Company is required";

    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Invalid email format";
    }

    if (data.website && !/^https?:\/\/.+/.test(data.website)) {
      newErrors.website = "URL must start with http:// or https://";
    }

    if (data.value && isNaN(Number(data.value.replace(/,/g, "")))) {
      newErrors.value = "Value must be a number";
    }

    return newErrors;
  };

  useEffect(() => {
    const errorList = validate(formData);
    setErrors(errorList);
    setIsValid(Object.keys(errorList).length === 0);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;

    saveLead({
      name: `${formData.firstName} ${formData.lastName}`,
      ...formData,
    });

    toast.success("Lead added successfully!");
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
              onBlur={handleBlur}
              error={touched.firstName && errors.firstName}
              placeholder="John"
              required
            />
            <InputGroup
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lastName && errors.lastName}
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
            onBlur={handleBlur}
            error={touched.email && errors.email}
            placeholder="john.doe@company.com"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="company"
              label="Company"
              value={formData.company}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.company && errors.company}
              placeholder="Acme Inc."
              required
            />
            <InputGroup
              id="jobTitle"
              label="Job Title"
              value={formData.jobTitle}
              onChange={handleChange}
              onBlur={handleBlur}
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
              onBlur={handleBlur}
              error={touched.website && errors.website}
              placeholder="https://example.com"
            />
            <InputGroup
              id="value"
              label="Lead Value (Income)"
              value={formData.value}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.value && errors.value}
              placeholder="5000000"
            />
          </div>

          {/* Address Section */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Address Info
            </h3>
            <div className="space-y-6">
              <InputGroup
                id="street"
                label="Street"
                value={formData.street}
                onChange={handleChange}
                placeholder="123 Main St"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  id="city"
                  label="City"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
                <InputGroup
                  id="state"
                  label="State"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  id="zipCode"
                  label="Zip Code"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
                <InputGroup
                  id="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="USA"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
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
              disabled={!isValid}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                isValid
                  ? "bg-[#344873] text-white hover:bg-[#253860]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Save Person
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ id, label, type = "text", error, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {props.required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${
        error
          ? "border-red-300 focus:ring-red-200 focus:border-red-500"
          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      } ${props.disabled ? "bg-gray-50 text-gray-500" : ""}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default AddLead;
