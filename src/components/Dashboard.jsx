import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, Link, Route, Routes, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import Modal from "react-modal";
import JobApplicationDetail from "./JobApplicationDetail";
import "./Dashboard.css"; // Import the CSS file for styling

// Set the root element for accessibility
Modal.setAppElement("#root");

const Dashboard = () => {
  const [jobApplications, setJobApplications] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [filters, setFilters] = useState({
    cgpa: "",
    branch: "",
    ssc: "",
    hsc: "",
  });

  useEffect(() => {
    const fetchJobApplications = async () => {
      try {
        const { data } = await axios.get(
          "https://backend-1-qebm.onrender.com/api/v1/jobApplication/getall",
          { withCredentials: true }
        );
        setJobApplications(data.jobApplications);
      } catch (error) {
        setJobApplications([]);
      }
    };
    fetchJobApplications();
  }, []);

  const handleUpdateStatus = async (jobApplicationId, status) => {
    try {
      const { data } = await axios.put(
        `https://backend-1-qebm.onrender.com/api/v1/jobApplication/update/${jobApplicationId}`,
        { status },
        { withCredentials: true }
      );
      setJobApplications((prevJobApplications) =>
        prevJobApplications.map((jobApplication) =>
          jobApplication._id === jobApplicationId
            ? { ...jobApplication, status }
            : jobApplication
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const openModal = (url) => {
    setProofUrl(url);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setProofUrl("");
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredApplications = jobApplications.filter((application) => {
    return (
      (filters.cgpa ? application.cgpa >= filters.cgpa : true) &&
      (filters.branch ? application.branch === filters.branch : true) &&
      (filters.ssc ? application.ssc >= filters.ssc : true) &&
      (filters.hsc ? application.hsc >= filters.hsc : true)
    );
  });

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <section className="dashboard page">
              <div className="banner">
                <div className="firstBox">
                  
                  <div className="content">
                    <div>
                      <p>Hello ,</p>
                      <h5>{admin && `${admin.firstName} ${admin.lastName}`}</h5>
                    </div>
                    <p>
                      Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                      Facilis, nam molestias. Eaque molestiae ipsam commodi neque.
                      Assumenda repellendus necessitatibus itaque.
                    </p>
                  </div>
                </div>
                <div className="secondBox">
                  <p>Total Job Applications</p>
                  <h3>{jobApplications.length}</h3>
                </div>
                <div className="thirdBox">
                  <p>Registered Administrators</p>
                  <h3>1</h3>
                </div>
              </div>
              <div className="banner">
                <h5>Job Applications</h5>
                <div className="filters">
                  <select name="cgpa" value={filters.cgpa} onChange={handleFilterChange}>
                    <option value="">Filter by CGPA</option>
                    <option value="3.0">3.0+</option>
                    <option value="3.5">3.5+</option>
                    <option value="4.0">4.0</option>
                  </select>
                  <select name="branch" value={filters.branch} onChange={handleFilterChange}>
                    <option value="">Filter by Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                  </select>
                  <select name="ssc" value={filters.ssc} onChange={handleFilterChange}>
                    <option value="">Filter by SSC Marks</option>
                    <option value="80">80+</option>
                    <option value="90">90+</option>
                  </select>
                  <select name="hsc" value={filters.hsc} onChange={handleFilterChange}>
                    <option value="">Filter by HSC Marks</option>
                    <option value="80">80+</option>
                    <option value="90">90+</option>
                  </select>
                </div>
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Registration Number</th>
                      <th>CGPA</th>
                      <th>HSC Marks</th>
                      <th>SSC Marks</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.length > 0
                      ? filteredApplications.map((application) => (
                          <tr key={application._id}>
                            <td>{application.fullName}</td>
                            <td>
                              <Link to={`/job-application/${application.reg}`}>
                                {application.reg}
                              </Link>
                            </td>
                            <td>{application.cgpa}</td>
                            <td>{application.hsc}</td>
                            <td>{application.ssc}</td>
                            <td>{application.branch}</td>
                            <td>
                              <select
                                className={
                                  application.status === "Pending"
                                    ? "value-pending"
                                    : application.status === "Accepted"
                                    ? "value-accepted"
                                    : "value-rejected"
                                }
                                value={application.status}
                                onChange={(e) =>
                                  handleUpdateStatus(application._id, e.target.value)
                                }
                              >
                                <option value="Pending" className="value-pending">
                                  Pending
                                </option>
                                <option value="Accepted" className="value-accepted">
                                  Accepted
                                </option>
                                <option value="Rejected" className="value-rejected">
                                  Rejected
                                </option>
                              </select>
                            </td>
                            <td>
                              {application.status === "Accepted" ? (
                                <GoCheckCircleFill className="green" />
                              ) : (
                                <AiFillCloseCircle className="red" />
                              )}
                            </td>
                          </tr>
                        ))
                      : "No Job Applications Found!"}
                  </tbody>
                </table>
              </div>
            </section>
          }
        />
        <Route path="/job-application/:registrationNumber" element={<JobApplicationDetail />} />
      </Routes>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Proof Modal"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
          },
        }}
      >
        <button onClick={closeModal}>Close</button>
        <div className="proof-content">
          {proofUrl.endsWith(".pdf") ? (
            <embed src={proofUrl} width="100%" height="100%" type="application/pdf" />
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

export default Dashboard;
