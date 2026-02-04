import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "../components/common/Dropdown";
import { leadsApi } from "../services/leadsApi";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const mapFieldName = (name) => {
    const mapping = {
      firstName: "name",
      lastName: "name",
      jobTitle: "position",
      platform: "source",
      status: "stage",
    };
    return mapping[name] || name;
  };

  const getErrorMessage = (value) =>
    Array.isArray(value) ? value.join(" ") : value;

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
    const mapped = mapFieldName(name);
    setFieldErrors((prev) => ({ ...prev, [mapped]: undefined }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      await leadsApi.createLead({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || "",
        company: formData.company,
        position: formData.jobTitle,
        stage: formData.status,
        status: "Active",
        source: formData.platform,
        value: formData.value || "0",
        notes: `Address: ${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
      });

      toast.success("Lead added successfully!");
      navigate("/leads");
    } catch (err) {
      console.error("Error creating lead:", err);
      const responseErrors = err.response?.data;
      if (responseErrors && typeof responseErrors === "object") {
        setFieldErrors(responseErrors);
        const firstError = Object.values(responseErrors).flat()?.[0];
        setError(firstError || "Failed to create lead");
      } else {
        setError("Failed to create lead");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

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
              placeholder="John"
              error={
                getErrorMessage(fieldErrors.name) ||
                (touched.firstName && errors.firstName)
              }
              required
            />
            <InputGroup
              id="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Doe"
              error={
                getErrorMessage(fieldErrors.name) ||
                (touched.lastName && errors.lastName)
              }
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
            placeholder="john.doe@company.com"
            error={
              getErrorMessage(fieldErrors.email) ||
              (touched.email && errors.email)
            }
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup
              id="company"
              label="Company"
              value={formData.company}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Acme Inc."
              error={
                getErrorMessage(fieldErrors.company) ||
                (touched.company && errors.company)
              }
              required
            />
            <InputGroup
              id="jobTitle"
              label="Job Title"
              value={formData.jobTitle}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Sales Manager"
              error={getErrorMessage(fieldErrors.position)}
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
              error={
                getErrorMessage(fieldErrors.value) ||
                (touched.value && errors.value)
              }
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
            {fieldErrors.source && (
              <p className="text-xs text-red-600 mt-1">
                {getErrorMessage(fieldErrors.source)}
              </p>
            )}
            <InputGroup
              id="createdOn"
              label="Created On"
              value={formData.createdOn}
              disabled
            />
          </div>

          <Dropdown
            label="Stage"
            options={["New", "Opened", "Interested", "Rejected"]}
            value={formData.status}
            onChange={(val) =>
              handleChange({ target: { name: "status", value: val } })
            }
          />
          {(fieldErrors.stage || fieldErrors.status) && (
            <p className="text-xs text-red-600 mt-1">
              {getErrorMessage(fieldErrors.stage || fieldErrors.status)}
            </p>
          )}

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
              disabled={loading || !isValid}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isValid || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#344873] text-white hover:bg-[#253860]"
              }`}
            >
                {loading ? "Saving..." : "Save Person"}
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
