// src/components/AddPgModal.js
import React, { useState } from 'react';
import { X, Check, Upload, Wifi, Coffee, Tv, DollarSign } from 'lucide-react';

const AddPgModal = ({ onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    description: "",
    rooms: "",
    occupancy: "Single",
    amenities: [],
    image: "/api/placeholder/400/250",
    gender: "Any"
  });

  const totalSteps = 4;

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleAmenity = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const goToNextStep = () => {
    setCurrentStep(currentStep < totalSteps ? currentStep + 1 : currentStep);
  };

  const goToPreviousStep = () => {
    setCurrentStep(currentStep > 1 ? currentStep - 1 : currentStep);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold">Add New PG</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      {/* Stepper */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step ? <Check size={16} /> : step}
              </div>
              <span className="text-xs mt-1 text-gray-500">
                {step === 1 && "Basic Info"}
                {step === 2 && "Details"}
                {step === 3 && "Amenities"}
                {step === 4 && "Preview"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PG Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter PG name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload PG Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {currentStep === 2 && (
          <div>
            <h3 className="text-lg font-medium mb-4">PG Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per month (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData("price", e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                    placeholder="Enter monthly rent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Rooms</label>
                <input
                  type="number"
                  value={formData.rooms}
                  onChange={(e) => updateFormData("rooms", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Number of rooms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Type</label>
                <select
                  value={formData.occupancy}
                  onChange={(e) => updateFormData("occupancy", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Multiple">Multiple</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateFormData("gender", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="Any">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Describe your PG..."
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Amenities */}
        {currentStep === 3 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer ${
                  formData.amenities.includes("WiFi") ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onClick={() => toggleAmenity("WiFi")}
              >
                <Wifi size={20} className={formData.amenities.includes("WiFi") ? "text-indigo-600" : "text-gray-400"} />
                <span className="ml-2">WiFi</span>
                {formData.amenities.includes("WiFi") && (
                  <Check size={16} className="ml-auto text-indigo-600" />
                )}
              </div>

              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer ${
                  formData.amenities.includes("AC") ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onClick={() => toggleAmenity("AC")}
              >
                <span className={formData.amenities.includes("AC") ? "text-indigo-600" : "text-gray-400"}>❄️</span>
                <span className="ml-2">AC</span>
                {formData.amenities.includes("AC") && (
                  <Check size={16} className="ml-auto text-indigo-600" />
                )}
              </div>

              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer ${
                  formData.amenities.includes("Food") ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onClick={() => toggleAmenity("Food")}
              >
                <Coffee size={20} className={formData.amenities.includes("Food") ? "text-indigo-600" : "text-gray-400"} />
                <span className="ml-2">Food</span>
                {formData.amenities.includes("Food") && (
                  <Check size={16} className="ml-auto text-indigo-600" />
                )}
              </div>

              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer ${
                  formData.amenities.includes("TV") ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onClick={() => toggleAmenity("TV")}
              >
                <Tv size={20} className={formData.amenities.includes("TV") ? "text-indigo-600" : "text-gray-400"} />
                <span className="ml-2">TV</span>
                {formData.amenities.includes("TV") && (
                  <Check size={16} className="ml-auto text-indigo-600" />
                )}
              </div>

              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer ${
                  formData.amenities.includes("Laundry") ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onClick={() => toggleAmenity("Laundry")}
              >
                <span className={formData.amenities.includes("Laundry") ? "text-indigo-600" : "text-gray-400"}>🧺</span>
                <span className="ml-2">Laundry</span>
                {formData.amenities.includes("Laundry") && (
                  <Check size={16} className="ml-auto text-indigo-600" />
                )}
              </div>

              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer ${
                  formData.amenities.includes("Parking") ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onClick={() => toggleAmenity("Parking")}
              >
                <span className={formData.amenities.includes("Parking") ? "text-indigo-600" : "text-gray-400"}>🅿️</span>
                <span className="ml-2">Parking</span>
                {formData.amenities.includes("Parking") && (
                  <Check size={16} className="ml-auto text-indigo-600" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 4 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Preview and Confirm</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">PG Name</p>
                  <p className="font-medium">{formData.name || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="font-medium">{formData.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="font-medium">₹{formData.price || "0"}/month</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rooms</p>
                  <p className="font-medium">{formData.rooms || "0"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Occupancy</p>
                  <p className="font-medium">{formData.occupancy}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Gender</p>
                  <p className="font-medium">{formData.gender}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm mt-1">{formData.description || "No description provided."}</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">Amenities</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.amenities.length > 0 ? (
                    formData.amenities.map((amenity, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No amenities selected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 border-t flex justify-between">
        <button
          onClick={currentStep === 1 ? onClose : goToPreviousStep}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </button>
        
        <button
          onClick={currentStep === totalSteps ? handleSubmit : goToNextStep}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {currentStep === totalSteps ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default AddPgModal;