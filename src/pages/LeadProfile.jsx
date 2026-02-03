import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Pencil,
  Mail,
  Phone,
  Briefcase,
  Link,
  Calendar,
  FileText,
  MapPin,
  User,
  X,
  Upload,
  Eye,
  Trash2,
} from "lucide-react";
import { leadsApi } from "../services/leadsApi";

const LeadProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activeTab, setActiveTab] = useState("leadInfo");
  const [composerTab, setComposerTab] = useState("activity");

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeLead = (data) => ({
    ...data,
    status: data.stage ?? data.status,
    jobTitle: data.position ?? data.jobTitle,
    platform: data.source ?? data.platform,
    createdOn: data.created_at
      ? new Date(data.created_at).toLocaleDateString("en-GB")
      : data.createdOn,
    activities: data.activities || [],
    deals: data.deals || [],
    documents: data.documents || [],
  });

  const fetchLead = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLead(id);
      setLead(normalizeLead(response.data));
    } catch (err) {
      console.error("Error fetching lead:", err);
      setError("Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!lead) return <div className="p-8">Lead not found</div>;

  const handleStatusChange = async (newStatus) => {
    try {
      await leadsApi.updateLead(lead.id, { stage: newStatus });
      setLead({ ...lead, status: newStatus, stage: newStatus });
      setStatusDropdownOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    }
  };

  const updateLeadDetails = async (updates) => {
    try {
      await leadsApi.updateLead(lead.id, updates);
      setLead((prev) => ({ ...prev, ...updates }));
      setError("");
    } catch (err) {
      console.error("Error updating lead:", err);
      setError("Failed to update lead");
    }
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const updatedDocs = lead.documents.filter((d) => d.id !== docId);
      const updatedLead = { ...lead, documents: updatedDocs };
      setLead(updatedLead);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    let updated = { ...lead };

    if (modalType === "editProfile") {
      Object.keys(formData).forEach((key) => {
        if (formData[key]) updated[key] = formData[key];
      });
      const updatesForApi = {
        name: updated.name,
        company: updated.company,
        position: updated.jobTitle,
        value: updated.value,
      };
      updateLeadDetails(updatesForApi);
    } else if (modalType === "task") {
      updated.activities = [
        {
          id: Date.now(),
          type: "task",
          title: `Task: ${formData.title}`,
          desc: formData.description,
          date: new Date().toLocaleDateString(),
          priority: formData.priority || "Normal",
        },
        ...updated.activities,
      ];
      setComposerTab("tasks");
    } else if (modalType === "appointment") {
      updated.activities = [
        {
          id: Date.now(),
          type: "appointment",
          title: formData.title,
          location: formData.location,
          with: formData.withPerson,
          date: formData.date,
          time: formData.time,
        },
        ...updated.activities,
      ];
      setComposerTab("appointments");
    } else if (modalType === "deal") {
      updated.deals = [
        {
          id: Date.now(),
          title: formData.title,
          value: formData.value,
          closingDate: formData.date,
        },
        ...updated.deals,
      ];
    } else if (modalType === "document") {
      if (formData.file) {
        const fileUrl = URL.createObjectURL(formData.file);
        updated.documents = [
          {
            id: Date.now(),
            name: formData.file.name,
            size: formatFileSize(formData.file.size),
            url: fileUrl,
            type: formData.file.type,
          },
          ...updated.documents,
        ];
      }
    }

    setLead(updated);
    setIsModalOpen(false);
  };

  const openModal = (type) => {
    setModalType(type);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-6 overflow-auto">
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
      <div className="mb-4">
        <button
          onClick={() => navigate("/leads")}
          className="flex items-center text-gray-600 hover:text-gray-900 font-medium"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Back Leads</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-teal-100 mb-4 overflow-hidden border-4 border-white shadow-sm">
              <img
                src={
                  lead.image ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`
                }
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.name}`;
                }}
                alt={lead.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-500 mb-6">{lead.company}</p>

            <div className="flex w-full border-b border-gray-200 mb-6">
              {["leadInfo", "addressInfo"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 pb-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {tab.replace("Info", " Info")}
                </button>
              ))}
            </div>

            <div className="w-full space-y-5">
              {activeTab === "leadInfo" ? (
                <>
                  <InfoItem
                    icon={<Briefcase size={16} />}
                    label="Job Title"
                    value={lead.jobTitle}
                  />
                  <InfoItem
                    icon={<Link size={16} />}
                    label="Url"
                    value={lead.website}
                    isLink
                  />
                  <InfoItem
                    icon={<User size={16} />}
                    label="Lead Source"
                    value={lead.platform}
                  />
                  <InfoItem
                    icon={<span className="font-bold text-gray-400">₹</span>}
                    label="Deal Value"
                    value={lead.value}
                  />
                  <InfoItem
                    icon={<Calendar size={16} />}
                    label="Created on"
                    value={lead.createdOn || "N/A"}
                  />
                  <StatusItem status={lead.status} />
                </>
              ) : (
                <>
                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="Street Address"
                    value={lead.street}
                  />
                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="City"
                    value={lead.city}
                  />
                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="State"
                    value={lead.state}
                  />
                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="Zip Code"
                    value={lead.zipCode}
                  />
                  <InfoItem
                    icon={<MapPin size={16} />}
                    label="Country"
                    value={lead.country}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity Composer
            </h3>
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4 mb-4">
              {["Activity", "Appointments", "Tasks", "Emails", "Meetings"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setComposerTab(tab.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      composerTab === tab.toLowerCase()
                        ? "bg-[#344873] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <div className="space-y-6">
              {(composerTab === "activity" || composerTab === "emails") && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    {composerTab === "emails" ? "Emails" : "Latest Activity"}
                  </h4>
                  <div className="space-y-6 relative pl-2">
                    <div className="absolute left-[16px] top-2 bottom-2 w-0.5 bg-gray-200 border-dashed border-l-2 border-gray-200"></div>
                    {lead.activities.map(
                      (act) =>
                        (composerTab === "activity" ||
                          (composerTab === "emails" &&
                            act.type === "email")) && (
                          <ActivityItem key={act.id} item={act} />
                        )
                    )}
                  </div>
                </div>
              )}

              {(composerTab === "activity" ||
                composerTab === "appointments" ||
                composerTab === "meetings") && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Appointments
                    </h4>
                    <button
                      onClick={() => openModal("appointment")}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      + Create New
                    </button>
                  </div>
                  {lead.activities
                    .filter((a) => a.type === "appointment")
                    .map((appt) => (
                      <AppointmentItem key={appt.id} item={appt} />
                    ))}
                </div>
              )}

              {(composerTab === "activity" || composerTab === "tasks") && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Tasks
                    </h4>
                    <button
                      onClick={() => openModal("task")}
                      className="text-sm text-blue-600 font-medium hover:underline"
                    >
                      + Create Task
                    </button>
                  </div>
                  {lead.activities
                    .filter((a) => a.type === "task")
                    .map((task) => (
                      <TaskItem key={task.id} item={task} />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/4 flex flex-col gap-6 bg-white border-gray-200 rounded-xl p-4 h-fit">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Lead Profile
            </h3>
            <button
              onClick={() => openModal("editProfile")}
              className="text-gray-400 hover:text-gray-600"
            >
              <Pencil size={18} />
            </button>
          </div>

          <div className="relative">
            <div
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="bg-white rounded-full border border-gray-200 px-4 py-2 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    lead.status === "Opened"
                      ? "bg-yellow-400"
                      : lead.status === "New"
                      ? "bg-green-400"
                      : lead.status === "Interested"
                      ? "bg-purple-400"
                      : lead.status === "Rejected"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900">
                  {lead.status}
                </span>
              </div>
              <ChevronLeft
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  statusDropdownOpen ? "rotate-90" : "rotate-270"
                }`}
              />
            </div>
            {statusDropdownOpen && (
              <div className="absolute top-12 left-0 w-full bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                {["New", "Opened", "Interested", "Rejected", "Closed"].map(
                  (status) => (
                    <div
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          status === "Opened"
                            ? "bg-yellow-400"
                            : status === "New"
                            ? "bg-green-400"
                            : status === "Interested"
                            ? "bg-purple-400"
                            : status === "Rejected"
                            ? "bg-red-400"
                            : "bg-gray-300"
                        }`}
                      ></div>
                      {status}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Company
            </h4>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
                  <Briefcase size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {lead.company}
                  </div>
                  <div className="text-xs text-gray-500">Techno.com</div>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <span>+91 9876543211</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Deals</h4>
            <div className="space-y-3">
              <button
                onClick={() => openModal("deal")}
                className="w-full py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                + Create new deal
              </button>
              {lead.deals.map((deal) => (
                <div key={deal.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">
                    Closing date: {deal.closingDate}
                  </div>
                  <div className="font-medium text-gray-900">{deal.title}</div>
                  <div className="text-sm text-gray-500">{deal.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Attachment
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => openModal("document")}
                className="w-full py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                + Upload Document
              </button>
              {lead.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-auto flex items-center justify-center bg-gray-100 rounded">
                      <FileText size={16} className="text-gray-600" />
                    </div>
                    <div className="overflow-hidden">
                      <div
                        className="text-sm font-medium text-gray-900 truncate max-w-[120px]"
                        title={doc.name}
                      >
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-400">{doc.size}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
          type={modalType}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          onChange={(e) =>
            setFormData({ ...formData, [e.target.name]: e.target.value })
          }
          onFileChange={(e) =>
            setFormData({ ...formData, file: e.target.files[0] })
          }
          initialData={modalType === "editProfile" ? lead : {}}
        />
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value, isLink }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-gray-400">
      <div className="w-4 flex justify-center">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
    <div className="pl-6">
      {isLink ? (
        <a
          href={value}
          className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-gray-900">{value || "--"}</p>
      )}
    </div>
  </div>
);

const StatusItem = ({ status }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 text-gray-400 mb-1">
      <div className="w-4 flex justify-center">
        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
      </div>
      <span className="text-xs">Status</span>
    </div>
    <div className="pl-6 text-sm font-medium text-gray-900">{status}</div>
  </div>
);

const ActivityItem = ({ item }) => {
  const isEmail = item.type === "email";
  return (
    <div className="relative flex items-start gap-4">
      <div
        className={`w-8 h-8 rounded-full ${
          isEmail ? "bg-teal-100" : "bg-blue-100"
        } flex items-center justify-center shrink-0 z-10 border-2 border-white ring-1 ring-gray-100`}
      >
        {isEmail ? (
          <Mail size={14} className="text-teal-600" />
        ) : (
          <FileText size={14} className="text-blue-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
          <span className="text-xs text-blue-600 font-medium">{item.time}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
      </div>
    </div>
  );
};

const AppointmentItem = ({ item }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="text-center w-24">
      <div className="text-xs text-orange-500 font-medium uppercase">New</div>
      <div className="text-lg font-bold text-gray-900">{item.date}</div>
      <div className="text-xs text-gray-500">{item.time}</div>
    </div>
    <div className="w-px bg-gray-200 h-16 mx-2"></div>
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span>
          {item.title} with{" "}
          <span className="text-orange-500 font-medium">{item.with}</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <MapPin size={12} />
        <span>{item.location}</span>
      </div>
    </div>
  </div>
);

const TaskItem = ({ item }) => (
  <div className="mb-6 border-b border-gray-100 pb-4">
    <div className="flex items-start gap-4">
      <div className="text-center w-24">
        <div className="text-xs text-orange-500 font-medium uppercase">
          Today
        </div>
        <div className="text-lg font-bold text-gray-900">{item.date}</div>
      </div>
      <div className="w-px bg-gray-200 h-16 mx-2"></div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>{item.title}</span>
        </div>
        <p className="text-xs text-gray-400 pl-4">{item.desc}</p>
      </div>
    </div>
  </div>
);

const Modal = ({
  type,
  onClose,
  onSubmit,
  onChange,
  onFileChange,
  initialData,
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div
      className={`bg-white rounded-2xl p-6 shadow-xl relative ${
        type === "editProfile"
          ? "w-[500px] max-h-[90vh] overflow-y-auto"
          : "w-[400px]"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>
      <h3 className="text-xl font-bold text-gray-900 mb-4 capitalize">
        {type === "editProfile" ? "Edit Profile" : `Create ${type}`}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        {type === "editProfile" ? (
          <>
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Basic Info
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                defaultValue={initialData.name}
                placeholder="Name"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="company"
                defaultValue={initialData.company}
                placeholder="Company"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="jobTitle"
                defaultValue={initialData.jobTitle}
                placeholder="Job Title"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="value"
                defaultValue={initialData.value}
                placeholder="Value"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="website"
                defaultValue={initialData.website}
                placeholder="Website"
                className="col-span-2 w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
            </div>
            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mt-4">
              Address Info
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <input
                name="street"
                defaultValue={initialData.street}
                placeholder="Street"
                className="col-span-2 w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="city"
                defaultValue={initialData.city}
                placeholder="City"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="state"
                defaultValue={initialData.state}
                placeholder="State"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="zipCode"
                defaultValue={initialData.zipCode}
                placeholder="Zip Code"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
              <input
                name="country"
                defaultValue={initialData.country}
                placeholder="Country"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
              />
            </div>
          </>
        ) : type === "task" ? (
          <>
            <input
              name="title"
              placeholder="Task Title"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm h-20"
              onChange={onChange}
            ></textarea>
            <select
              name="priority"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
            >
              <option>Normal</option>
              <option>High</option>
            </select>
          </>
        ) : type === "appointment" ? (
          <>
            <input
              name="title"
              placeholder="Title"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                name="date"
                type="date"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
                required
              />
              <input
                name="time"
                type="time"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                onChange={onChange}
                required
              />
            </div>
            <input
              name="withPerson"
              placeholder="With whom?"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
            />
            <input
              name="location"
              placeholder="Location"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
            />
          </>
        ) : type === "deal" ? (
          <>
            <input
              name="title"
              placeholder="Deal Name"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
              required
            />
            <input
              name="value"
              placeholder="Value"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
              required
            />
            <input
              name="date"
              type="date"
              placeholder="Closing Date"
              className="w-full p-2 border border-gray-200 rounded-lg text-sm"
              onChange={onChange}
            />
          </>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload size={24} className="text-gray-400 mb-2" />
            <label
              htmlFor="file-upload"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              <span>Click to upload</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                onChange={onFileChange}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF</p>
          </div>
        )}
        <button
          type="submit"
          className="w-full py-2.5 bg-[#344873] text-white rounded-lg font-bold text-sm hover:bg-[#2a3b5e] transition-colors"
        >
          {type === "document" ? "Upload" : "Save"}
        </button>
      </form>
    </div>
  </div>
);

export default LeadProfile;
