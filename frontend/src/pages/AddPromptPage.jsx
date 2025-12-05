import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CreatableSelect from 'react-select/creatable';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CopyPromptButton from "../components/CopyPromptButton";
 
const TASK_TYPE_CHOICES = {
  create_content: 'Create Content',
  create_code: 'Create Code',
  research: 'Research',
  deep_research: 'Deep Research / Analysis',
  plan_organize: 'Plan & Organize',
  ideate: 'Ideate / Brainstorm',
  summarize: 'Summarize / Review',
  explain: 'Explain / Teach',
  optimize: 'Optimize / Improve',
};
 
const OUTPUT_FORMAT_CHOICES = {
  text: 'Text',
  code: 'Code',
  chart_graph: 'Chart / Graph',
  checklist_table: 'Checklist / Table',
  template_framework: 'Template / Framework',
  image_visual: 'Image / Visual',
  slide_report: 'Slide / Report',
};
 
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#14b8a6' : '#5eead4',
    borderWidth: '1px',
    boxShadow: state.isFocused ? '0 0 0 2px #99f6e4' : 'none',
    backgroundColor: state.isDisabled ? '#f3f4f6' : '#fff',
    borderRadius: '0.75rem',
    minHeight: '44px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': { borderColor: '#14b8a6' },
    zIndex: 30,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#0d9488' : state.isFocused ? '#ccfbf1' : '#fff',
    color: state.isSelected ? '#fff' : '#111827',
    '&:hover': { backgroundColor: '#99f6e4' },
  }),
  singleValue: (provided) => ({ ...provided, color: '#111827' }),
  placeholder: (provided) => ({ ...provided, color: '#6b7280' }),
  menu: (provided) => ({ ...provided, borderRadius: '0.75rem', overflow: 'hidden', zIndex: 9999 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};
 
export default function AddPromptPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { promptId } = useParams();
  const [searchParams] = useSearchParams();
  const [isPublic, setIsPublic] = useState(true);
 
  const queryPromptId = searchParams.get('promptId');
  const queryReadOnly = searchParams.get('readonly') === 'true';
 
  const effectivePromptId = promptId || queryPromptId;
  const isEditMode = Boolean(promptId);
  const isViewMode = Boolean(queryPromptId && queryReadOnly);
 
  const [promptTitle, setPromptTitle] = useState('');
  const [promptDescription, setPromptDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [guidance, setGuidance] = useState('');
  const [statusMessage] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [selectedOutputFormat, setSelectedOutputFormat] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [promptOwnerUsername, setPromptOwnerUsername] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
 
  const CATEGORY_CHOICES = {
    software: 'Software',
    content_comms: 'Communication',
    design: 'Design',
    engineering: 'Engineering',
    finance: 'Finance',
    hr: 'Human Resources',
    learning: 'Learning & Development',
    marketing: 'Marketing',
    product_management: 'Product Management',
    support: 'Support'
  };
 
  const taskTypeOptions = Object.entries(TASK_TYPE_CHOICES).map(([value, label]) => ({
    value,
    label,
  }));
 
  const outputFormatOptions = Object.entries(OUTPUT_FORMAT_CHOICES).map(([value, label]) => ({
    value,
    label,
  }));
 
  const categoryOptions = Object.entries(CATEGORY_CHOICES).map(
    ([value, label]) => ({ value, label })
  );
 
  const checkIsAdmin = (userObj) => {
    if (!userObj) return false;
    return Boolean(
      userObj.is_staff === true ||
      userObj.is_superuser === true ||
      userObj.isStaff === true ||
      userObj.isSuperuser === true ||
      userObj.role === 'admin' ||
      userObj.role === 'staff'
    );
  };
 
  useEffect(() => {
    if (!effectivePromptId) {
      setCanEdit(true);
      return;
    }
 
    setLoading(true);
    const fetchPrompt = async () => {
      try {
        const res = await api.get(`/prompts/${effectivePromptId}/`);
        const d = res.data;
 
        setPromptTitle(d.title || '');
        setPromptDescription(d.prompt_description || '');
        setPromptText(d.prompt_text || '');
        setGuidance(d.guidance || '');
 
        if (d.task_type) {
          setSelectedTaskType({
            value: d.task_type,
            label: TASK_TYPE_CHOICES[d.task_type] || d.task_type,
          });
        }
        if (d.output_format) {
          setSelectedOutputFormat({
            value: d.output_format,
            label: OUTPUT_FORMAT_CHOICES[d.output_format] || d.output_format,
          });
        }
        if (d.category) {
          setSelectedCategory({
            value: d.category,
            label: d.category,
          });
        }
 
        const ownerUsername = d.user_username ?? d.user?.username ?? null;
        setPromptOwnerUsername(ownerUsername);
 
        const userIsOwner = Boolean(user) && Boolean(ownerUsername) && user.username === ownerUsername;
        setIsOwner(userIsOwner);
 
        const userIsAdmin = checkIsAdmin(user);
        const userCanEdit = userIsOwner || userIsAdmin;
        setCanEdit(userCanEdit);
      } catch (err) {
        console.error('❌ Failed to load prompt', err);
        alert('Failed to load prompt.');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
 
    fetchPrompt();
  }, [effectivePromptId, user, isEditMode, navigate]);
 
  const isReadOnly = isViewMode || (effectivePromptId && !canEdit && !isEditMode);
  const disabledClass = isReadOnly ? 'opacity-60 bg-gray-50 cursor-not-allowed' : '';
 
  const tealInputClasses = `block w-full rounded-lg border ${isReadOnly ? 'border-gray-300' : 'border-teal-300'
    } py-2 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-150 sm:text-sm sm:leading-6`;
 
  const cardClasses =
    'bg-white/90 backdrop-blur-sm border border-teal-200 shadow-md hover:shadow-lg transition-all duration-200 rounded-2xl';
 
  // --------------------------
  // FORM SUBMIT
  // --------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
 
    if (isReadOnly) {
      alert('This prompt is read-only.');
      return;
    }
 
    if (!promptTitle.trim() || !promptText.trim() || !selectedCategory) {
      toast.warning("Please fill in title, prompt, and department.");
      return;
    }
 
    const apiPrompt = {
      title: promptTitle,
      prompt_description: promptDescription,
      prompt_text: promptText,
      guidance,
      task_type: selectedTaskType?.value || '',
      output_format: selectedOutputFormat?.value || '',
      category: selectedCategory.value,
      is_public: isPublic,
    };
 
    try {
      if (isEditMode) {
        await api.put(`/prompts/${effectivePromptId}/`, apiPrompt);
        toast.success("Prompt updated successfully!");
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        const res = await api.post('/prompts/', apiPrompt);
 
        if (res.status === 201 || res.status === 200) {
         
          // ⭐ NEW BEHAVIOR (Private message)
          if (isPublic === false) {
            toast.success("Prompt added successfully and visible only to you.");
          } else {
            toast.success("Prompt added successfully! Pending approval.");
          }
 
          setPromptTitle('');
          setPromptDescription('');
          setPromptText('');
          setGuidance('');
          setSelectedTaskType(null);
          setSelectedOutputFormat(null);
          setSelectedCategory(null);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Failed to submit. See console for details.");
    }
  };
 
  const getPageTitle = () => {
    if (isEditMode && canEdit) return 'Edit Prompt';
    if (isReadOnly) return 'View Prompt';
    return 'Add a New Prompt';
  };
 
  const getPageDescription = () => {
    if (isReadOnly) return 'Viewing prompt details in read-only mode.';
    if (isEditMode) return 'Update the prompt below.';
    return 'Create a high-quality AI prompt.';
  };
 
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading prompt...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
 
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header />
 
      <ToastContainer position="top-right" />
 
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-teal-600 cursor-pointer text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition inline-flex items-center"
        >
          ← Back
        </button>
      </div>
 
      <main className="flex-grow container mx-auto px-6 md:px-10 lg:px-16 pt-4 pb-16 space-y-10 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-1">{getPageTitle()}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{getPageDescription()}</p>
 
          {effectivePromptId && !isOwner && promptOwnerUsername && (
            <p className="text-sm text-gray-500 mt-2">
              Created by: <span className="font-semibold">@{promptOwnerUsername}</span>
            </p>
          )}
 
          {effectivePromptId && canEdit && !isOwner && checkIsAdmin(user) && (
            <p className="text-sm text-teal-600 mt-1 font-medium">
              ✅ Editing as Admin
            </p>
          )}
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-10">
 
          <div className={`${cardClasses} p-6 md:p-8`}>
            <label className="text-lg font-semibold pt-4 text-gray-900 mb-3 pb-2 ">
              🛠️ Prompt Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={promptTitle}
              onChange={(e) => setPromptTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title..."
              className={`${tealInputClasses} ${disabledClass}`}
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
 
          {/* PROMPT */}
          <div className={`${cardClasses} p-5`}>
            <div className="flex items-center justify-between mb-3 pb-2">
              <label className="text-lg font-semibold pt-4 text-gray-900">
                {isReadOnly
                  ? '💡 Prompt'
                  : <>💡 Add Your Prompt <span className="text-red-500">*</span></>
                }
              </label>
              {isReadOnly && (
                <CopyPromptButton
                  promptId={effectivePromptId}
                  promptText={promptText}
                  promptTitle={promptTitle}
                />
              )}
            </div>
            <textarea
              rows="8"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className={`${tealInputClasses} ${disabledClass}`}
              placeholder="Type your core prompt content..."
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
 
          {/* DESCRIPTION + TASK TYPE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${cardClasses} p-5`}>
              <label className="text-lg font-semibold pt-4 text-gray-900 mb-3 pb-2 ">
                📝 Prompt Description
              </label>
              <textarea
                rows="4"
                value={promptDescription}
                onChange={(e) => setPromptDescription(e.target.value)}
                className={`${tealInputClasses} ${disabledClass}`}
                placeholder="Briefly describe the purpose..."
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
            </div>
 
            <div className={`${cardClasses} p-4`}>
              <h3 className="text-lg font-semibold pt-4 text-gray-900 mb-3 pb-2 border-b border-gray-200">
                ⚙️ Task Configuration
              </h3>
 
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose Task Type</label>
              <CreatableSelect
                isClearable
                options={taskTypeOptions}
                value={selectedTaskType}
                onChange={(nv) => setSelectedTaskType(nv)}
                placeholder="Select a task type..."
                styles={customStyles}
                isDisabled={isReadOnly}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isValidNewOption={() => false}
                formatCreateLabel={() => null}
                createOptionPosition={null}
              />
            </div>
          </div>
 
          {/* OUTPUT + CATEGORY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`${cardClasses} p-4`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                📄 Output Format
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose Output Format</label>
 
              <CreatableSelect
                isClearable
                options={outputFormatOptions}
                value={selectedOutputFormat}
                onChange={(nv) => setSelectedOutputFormat(nv)}
                placeholder="Select an output format..."
                styles={customStyles}
                isDisabled={isReadOnly}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isValidNewOption={() => false}
                createOptionPosition={null}
                formatCreateLabel={() => null}
              />
            </div>
 
            {/* CATEGORY */}
            <div className={`${cardClasses} p-4`}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
                🏷️ Department <span className="text-red-500">*</span>
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose a department
              </label>
 
              <CreatableSelect
                isClearable
                options={categoryOptions}
                value={selectedCategory}
                onChange={(nv) => setSelectedCategory(nv)}
                placeholder="Select department..."
                styles={customStyles}
                isDisabled={isReadOnly}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                isValidNewOption={() => false}
                createOptionPosition={null}
                formatCreateLabel={() => null}
              />
            </div>
          </div>
 
          {/* GUIDANCE */}
          <div className={`${cardClasses} p-6`}>
            <label className="text-lg font-semibold pt-4 text-gray-900 mb-3 pb-2">
              🎯 Guidance / Instructions
            </label>
            <textarea
              rows={5}
              value={guidance}
              onChange={(e) => setGuidance(e.target.value)}
              className={`${tealInputClasses} ${disabledClass}`}
              placeholder="Add optional context..."
              readOnly={isReadOnly}
              disabled={isReadOnly}
            />
          </div>
 
          {/* PUBLIC / PRIVATE TOGGLE */}
          <div className="bg-white/90 backdrop-blur-sm border border-teal-200 shadow-md rounded-2xl p-6">
            <label className="text-lg font-semibold text-gray-900 mb-3 pb-2 flex items-center gap-2">
              🔒 Visibility
            </label>
 
            <div className="flex gap-6 items-center text-gray-700 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic === true}
                  onChange={() => setIsPublic(true)}
                  disabled={isReadOnly}
                />
                Public (requires admin approval)
              </label>
 
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic === false}
                  onChange={() => setIsPublic(false)}
                  disabled={isReadOnly}
                />
                Private (no approval needed)
              </label>
            </div>
          </div>
 
          {!isReadOnly && (
            <div className="flex flex-col items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-teal-600 cursor-pointer text-white rounded-xl font-semibold shadow-md hover:bg-teal-700 disabled:opacity-60 transition-all text-lg"
              >
                {isEditMode ? '🚀 Update Prompt' : '🚀 Submit Prompt'}
              </button>
            </div>
          )}
        </form>
      </main>
 
      <Footer />
    </div>
  );
}
 
 