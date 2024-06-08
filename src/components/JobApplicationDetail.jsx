import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./JobApplicationDetail.css";
import { FaEye, FaEdit, FaSave, FaCheckCircle } from "react-icons/fa"; // Import FaCheckCircle for verification icon
import Modal from "react-modal";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const JobApplicationDetail = () => {
  const { reg } = useParams();
  const [jobApplication, setJobApplication] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [editMode, setEditMode] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobApplication = async () => {
      try {
        const response = await fetch(
          `https://backend-1-qebm.onrender.com/api/v1/jobApplication/detail/${reg}`,
          {
            credentials: 'include'
          }
        );
        const data = await response.json();
        setJobApplication(data.jobApplication);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching job application details:", error);
        setIsLoading(false);
      }
    };
    fetchJobApplication();
  }, [reg]);

  const openModal = (url) => {
    setProofUrl(url);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setProofUrl("");
  };

  const toggleEditMode = (field) => {
    setEditMode((prevEditMode) => ({
      ...prevEditMode,
      [field]: !prevEditMode[field],
    }));
  };

  const handleInputChange = (e, field) => {
    const value = e.target.type === 'file' ? e.target.files[0] : e.target.value;
    setJobApplication({ ...jobApplication, [field]: value });
  };

  const saveChanges = async (field) => {
    try {
      const formData = new FormData();
      if (jobApplication[field] instanceof File) {
        formData.append(field, jobApplication[field]);
      } else {
        formData.append(field, jobApplication[field]);
      }

      const endpoint = `https://backend-1-qebm.onrender.com/api/v1/jobApplication/update/${jobApplication._id}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setJobApplication(updatedApplication.jobApplication);
        setEditMode({});
      } else {
        const errorData = await response.json();
        console.error("Error saving changes:", errorData);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const toggleVerification = async (field) => {
    try {
      const isVerified = !jobApplication[field]?.verification?.isVerified;
      const verifiedBy = "Admin"; // This should be dynamically set based on the current user

      const endpoint = `https://backend-1-qebm.onrender.com/api/v1/jobApplication/update/${jobApplication._id}`;
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationUpdates: {
            [field]: {
              isVerified,
              verifiedBy,
            },
          },
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setJobApplication(updatedApplication.jobApplication);
      } else {
        const errorData = await response.json();
        console.error("Error updating verification status:", errorData);
      }
    } catch (error) {
      console.error("Error updating verification status:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!jobApplication) {
    return <div>Error loading job application details.</div>;
  }

  return (
    <>
      <div className="job-application-detail">
        <div className="header">
          <h1>Job Application Detail</h1>
        </div>
        <div className="details-container">
          <section className="detail-card">
            <h2>Personal Information</h2>
            {['fullName', 'email', 'phone', 'dob', 'gender', 'address'].map(field => (
              <div key={field} className="field">
                <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> 
                {editMode[field] ? (
                  field === 'dob' ? (
                    <input
                      type="date"
                      value={jobApplication[field]}
                      onChange={(e) => handleInputChange(e, field)}
                    />
                  ) : field === 'gender' ? (
                    <select
                      value={jobApplication[field]}
                      onChange={(e) => handleInputChange(e, field)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : field === 'address' ? (
                    <textarea
                      value={jobApplication[field]}
                      onChange={(e) => handleInputChange(e, field)}
                    />
                  ) : (
                    <input
                      type="text"
                      value={jobApplication[field]}
                      onChange={(e) => handleInputChange(e, field)}
                    />
                  )
                ) : (
                  <span>{jobApplication[field]}</span>
                )}
                <FaEdit onClick={() => toggleEditMode(field)} className="edit-icon" />
                {editMode[field] && <FaSave onClick={() => saveChanges(field)} className="save-icon" />}
                {jobApplication[field]?.verification && (
                  <>
                    <FaCheckCircle 
                      onClick={() => toggleVerification(field)} 
                      className={`verify-icon ${jobApplication[field].verification.isVerified ? 'verified' : ''}`} 
                    />
                    {jobApplication[field].verification.isVerified && (
                      <span className="verified-by">
                        Verified by {jobApplication[field].verification.verifiedBy}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
          <section className="detail-card">
            <h2>Educational Background</h2>
            {['cgpa', 'ssc', 'hsc'].map(field => (
              <div key={field} className="field">
                <strong>{field.toUpperCase()}:</strong> 
                {editMode[field] ? (
                  <input
                    type="text"
                    value={jobApplication[field]}
                    onChange={(e) => handleInputChange(e, field)}
                  />
                ) : (
                  <span>{jobApplication[field]}</span>
                )}
                <FaEdit onClick={() => toggleEditMode(field)} className="edit-icon" />
                {editMode[field] && <FaSave onClick={() => saveChanges(field)} className="save-icon" />}
                {jobApplication[field]?.verification && (
                  <>
                    <FaCheckCircle 
                      onClick={() => toggleVerification(field)} 
                      className={`verify-icon ${jobApplication[field].verification.isVerified ? 'verified' : ''}`} 
                    />
                    {jobApplication[field].verification.isVerified && (
                      <span className="verified-by">
                        Verified by {jobApplication[field].verification.verifiedBy}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
            {['cgpaProof', 'sscProof', 'hscProof'].map(field => (
              <div key={field} className="field">
                <strong>{field.replace('Proof', '').toUpperCase()} Proof:</strong> 
                {editMode[field] ? (
                  <>
                    <input type="file" onChange={(e) => handleInputChange(e, field)} />
                    <FaSave onClick={() => saveChanges(field)} className="save-icon" />
                  </>
                ) : (
                  <FaEye className="eye-icon" onClick={() => openModal(jobApplication[field]?.url)} />
                )}
                <FaEdit onClick={() => toggleEditMode(field)} className="edit-icon" />
                {jobApplication[field]?.verification && (
                  <>
                    <FaCheckCircle 
                      onClick={() => toggleVerification(field)} 
                      className={`verify-icon ${jobApplication[field].verification.isVerified ? 'verified' : ''}`} 
                    />
                    {jobApplication[field].verification.isVerified && (
                      <span className="verified-by">
                        Verified by {jobApplication[field].verification.verifiedBy}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
          <section className="detail-card">
            <h2>Professional Experience</h2>
            {['projects', 'internship'].map(field => (
              <div key={field} className="field">
                <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> 
                {editMode[field] ? (
                  <textarea
                    value={jobApplication[field]}
                    onChange={(e) => handleInputChange(e, field)}
                  />
                ) : (
                  <span>{jobApplication[field]}</span>
                )}
                <FaEdit onClick={() => toggleEditMode(field)} className="edit-icon" />
                {editMode[field] && <FaSave onClick={() => saveChanges(field)} className="save-icon" />}
                {jobApplication[field]?.verification && (
                  <>
                    <FaCheckCircle 
                      onClick={() => toggleVerification(field)} 
                      className={`verify-icon ${jobApplication[field].verification.isVerified ? 'verified' : ''}`} 
                    />
                    {jobApplication[field].verification.isVerified && (
                      <span className="verified-by">
                        Verified by {jobApplication[field].verification.verifiedBy}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
          <section className="detail-card">
            <h2>Additional Information</h2>
            {['branch', 'skills', 'references'].map(field => (
              <div key={field} className="field">
                <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> 
                {editMode[field] ? (
                  <textarea
                    value={jobApplication[field]}
                    onChange={(e) => handleInputChange(e, field)}
                  />
                ) : (
                  <span>{jobApplication[field]}</span>
                )}
                <FaEdit onClick={() => toggleEditMode(field)} className="edit-icon" />
                {editMode[field] && <FaSave onClick={() => saveChanges(field)} className="save-icon" />}
                {jobApplication[field]?.verification && (
                  <>
                    <FaCheckCircle 
                      onClick={() => toggleVerification(field)} 
                      className={`verify-icon ${jobApplication[field].verification.isVerified ? 'verified' : ''}`} 
                    />
                    {jobApplication[field].verification.isVerified && (
                      <span className="verified-by">
                        Verified by {jobApplication[field].verification.verifiedBy}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}
          </section>
        </div>
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Proof Modal"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%'
          },
        }}
      >
        <button onClick={closeModal} className="close-modal-button">Close</button>
        <div className="proof-content">
          {proofUrl.endsWith('.pdf') ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js">
              <div
                style={{
                  height: '100%',
                  width: '100%',
                }}
              >
                <Viewer fileUrl={proofUrl} />
              </div>
            </Worker>
          ) : (
            <img src={proofUrl} alt="Proof Document" style={{ width: "100%" }} />
          )}
          <div>
            <a href={proofUrl} target="_blank" rel="noopener noreferrer">
              Open Document
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JobApplicationDetail;
