import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosWithAuth from "../AxiosAuth";
import PetInfo from "./PetInfo";
import AppointmentModal from "./AppointmentModal";
import EditDiagnosisModal from "./EditDianosisModal";
import EditExaminationPlanModal from "./EditExaminationPlanModal";
import EditClinicalDiagnosisModal from "./EditClinicalDiagnosisModal";
import EditTreatmentModal from "./EditTreatmentModal";

const AnamnesisDetailsPage = () => {
    const { id } = useParams();
    const axiosInstance = useAxiosWithAuth();
    const [anamnesis, setAnamnesis] = useState(null);
    const [petInfo, setPetInfo] = useState(null);
    const [doctorName, setDoctorName] = useState("");
    const [diagnosis, setDiagnosis] = useState(null);
    const [clinicalDiagnoses, setClinicalDiagnoses] = useState([]);
    const [appointment, setAppointment] = useState(null);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isEditDiagnosisModalOpen, setIsEditDiagnosisModalOpen] = useState(false);
    const [isEditExaminationPlanModalOpen, setIsEditExaminationPlanModalOpen] = useState(false);
    const [isEditClinicalDiagnosisModalOpen, setIsEditClinicalDiagnosisModalOpen] = useState(false);
    const [selectedClinicalDiagnosis, setSelectedClinicalDiagnosis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [treatments, setTreatments] = useState([]);
    const [isEditTreatmentModalOpen, setIsEditTreatmentModalOpen] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const anamnesisResponse = await axiosInstance.get(`/anamnesis/${id}`);
                setAnamnesis(anamnesisResponse.data);

                const petResponse = await axiosInstance.get(`/pets/pet/${anamnesisResponse.data.pet}`);
                setPetInfo(petResponse.data);

                if (petResponse.data.actualVet) {
                    const doctorResponse = await axiosInstance.get(`/users/user-info/${petResponse.data.actualVet}`);
                    setDoctorName(doctorResponse.data.name);
                }

                const diagnosisResponse = await axiosInstance.get(`/diagnosis/preliminary-diagnosis/${id}`);
                console.log(diagnosisResponse.data)
                setDiagnosis(diagnosisResponse.data);

                const clinicalDiagnosesResponse = await axiosInstance.get(`/diagnosis/all-diagnoses/${id}`);
                setClinicalDiagnoses(clinicalDiagnosesResponse.data);

                const appointmentResponse = await axiosInstance.get(`/appointments/appointment/${anamnesisResponse.data.appointment}`);
                setAppointment(appointmentResponse.data);

                if (appointmentResponse.data.slotId) {
                    const slotResponse = await axiosInstance.get(`/slots/${appointmentResponse.data.slotId}`);
                    setAppointment(prevAppointment => ({
                        ...prevAppointment,
                        slot: slotResponse.data
                    }));
                }

                const treatmentsResponse = await axiosInstance.get(`/treatments/all-by-pet/${petResponse.data.id}`);
                setTreatments(treatmentsResponse.data);

                const userResponse = await axiosInstance.get("/users/current-user-info");
                setUserRole(userResponse.data.role);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, axiosInstance]);

    const handleSaveDiagnosis = async (updatedData) => {
        try {
            const response = await axiosInstance.put(`/diagnosis/update/${diagnosis.id}`, updatedData);
            setDiagnosis(response.data);
            setIsEditDiagnosisModalOpen(false);
            alert("Diagnosis updated successfully!");
        } catch (error) {
            console.error("Error updating diagnosis:", error);
            alert("Failed to update diagnosis. Please try again later.");
        }
    };

    const handleSaveExaminationPlan = async (updatedPlan) => {
        try {
            const updatedDiagnosis = { ...diagnosis, examinationPlan: updatedPlan };
            const response = await axiosInstance.put(`/diagnosis/update/${diagnosis.id}`, updatedDiagnosis);
            setDiagnosis(response.data);
            setIsEditExaminationPlanModalOpen(false);
            alert("Examination plan updated successfully!");
        } catch (error) {
            console.error("Error updating examination plan:", error);
            alert("Failed to update examination plan. Please try again later.");
        }
    };

    const handleSaveClinicalDiagnosis = async (clinicalDiagnosisData) => {
        try {
            if (selectedClinicalDiagnosis) {
                const response = await axiosInstance.put(`/diagnosis/update/${selectedClinicalDiagnosis.id}`, clinicalDiagnosisData);
                setClinicalDiagnoses(clinicalDiagnoses.map(d => d.id === response.data.id ? response.data : d));
            } else {
                const response = await axiosInstance.post("/diagnosis/save", { ...clinicalDiagnosisData, anamnesis: id });
                setClinicalDiagnoses([...clinicalDiagnoses, response.data]);
            }
            setIsEditClinicalDiagnosisModalOpen(false);
            alert("Clinical diagnosis saved successfully!");
        } catch (error) {
            console.error("Error saving clinical diagnosis:", error);
            alert("Failed to save clinical diagnosis. Please try again later.");
        }
    };

    const handleSaveTreatment = async (treatmentData) => {
        try {
            if (selectedTreatment) {
                const response = await axiosInstance.put(`/treatments/update/${selectedTreatment.id}`, treatmentData);
                setTreatments(treatments.map(t => t.id === response.data.id ? response.data : t));
            } else {
                const response = await axiosInstance.post("/treatments/add", treatmentData);
                setTreatments([...treatments, response.data]);
            }
            setIsEditTreatmentModalOpen(false);
            alert("Treatment saved successfully!");
        } catch (error) {
            console.error("Error saving treatment:", error);
            alert("Failed to save treatment. Please try again later.");
        }
    };

    const handleCompleteTreatment = async (treatmentId) => {
        try {
            const response = await axiosInstance.put(`/treatments/complete/${treatmentId}`);
            setTreatments(treatments.map(t => t.id === response.data.id ? response.data : t));
            alert("Treatment marked as complete!");
        } catch (error) {
            console.error("Error completing treatment:", error);
            alert("Failed to complete treatment. Please try again later.");
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!anamnesis || !petInfo) {
        return <div>No data found.</div>;
    }

    return (
        <div className="container mt-3" style={{display: "flex", gap: "20px"}}>
            <div>
                <PetInfo petInfo={petInfo} onEdit={() => {
                }}/>

                <div style={{marginTop: "20px"}}>
                    <h4 style={{marginBottom: '5px'}}>Diagnosis</h4>
                    <p >{diagnosis ? diagnosis.name : "No diagnosis provided."}</p>
                </div>
                <div style={{marginTop: "10px"}}>
                    <h4 style={{marginBottom: '5px'}}>Doctor</h4>
                    <p>{doctorName || "No doctor assigned."}</p>
                </div>
                <button className="button rounded-3 btn-no-border" onClick={() => window.history.back()}>Back to pet profile</button>
            </div>

            <div style={{flex: 1}}>

                <h2><strong>Anamnesis details </strong> (appeal
                    from {new Date(anamnesis.date).toLocaleDateString()}: {diagnosis.name} )</h2>
                <h3 className="py-1">Complaints</h3>
                <div className="bg-table element-space" style={{flex: 1}}>
                    <div>
                        <div style={{
                            marginTop: "14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <p>{anamnesis.description || "No complaints provided."}</p>
                            <button className="button rounded-3 btn-no-border"
                                    onClick={() => setIsAppointmentModalOpen(true)}>Show an appointment
                            </button>
                        </div>
                    </div>
                </div>
                <h3>Preliminary Diagnosis</h3>
                <div className="bg-table element-space prem_diagnsosis" style={{flex: 1}}>
                    <div style={{marginTop: "15px"}}>
                        {diagnosis ? (
                            <div style={{marginTop: "15px", display: "flex", flexDirection: "column", height: "100%"}}>
                                <p style={{marginBottom: '5px'}}><strong>Name:</strong> {diagnosis.name}</p>
                                <p style={{marginBottom: '5px'}}>
                                    <strong>Date:</strong> {new Date(diagnosis.date).toLocaleDateString()}</p>
                                <p style={{marginBottom: '5px'}}>
                                    <strong>Contagious:</strong> {diagnosis.contagious ? "Yes" : "No"}</p>
                                <p style={{marginBottom: '0px'}}><strong>Description:</strong> {diagnosis.description}</p>
                                <div style={{marginTop: "auto", textAlign: "right"}}>
                                    <button className="button btn-no-border"

                                            onClick={() => setIsEditDiagnosisModalOpen(true)}>Edit
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p>No preliminary diagnosis provided.</p>
                        )}
                    </div>
                </div>
                <h3>Examination Plan</h3>
                <div className="bg-table element-space" style={{flex: 1}}>
                    <div style={{marginTop: "20px"}}>
                        {diagnosis && diagnosis.examinationPlan ? (
                            <div style={{
                                marginTop: "20px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <p>{diagnosis.examinationPlan}</p>
                                <button className="button btn-no-border"
                                        onClick={() => setIsEditExaminationPlanModalOpen(true)}>Edit
                                </button>
                            </div>
                        ) : (
                            <p>No examination plan provided.</p>
                        )}
                    </div>
                </div>
                <h3>Clinical Diagnosis</h3>
                <div className="bg-table element-space prem_diagnsosis" style={{flex: 1}}>

                    <div style={{marginTop: "20px"}}>
                        {clinicalDiagnoses.length > 0 ? (
                            <table cellPadding="3" cellSpacing="0" className="uniq-table" >
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Contagious</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {clinicalDiagnoses.map((diagnosis) => (
                                    <tr key={diagnosis.id}>
                                        <td>{diagnosis.name}</td>
                                        <td>{diagnosis.description}</td>
                                        <td>{new Date(diagnosis.date).toLocaleDateString()}</td>
                                        <td>{diagnosis.contagious ? "Yes" : "No"}</td>
                                        <td>
                                            <button className="button btn-no-border" onClick={() => {
                                                setSelectedClinicalDiagnosis(diagnosis);
                                                setIsEditClinicalDiagnosisModalOpen(true);
                                            }}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No clinical diagnoses found.</p>
                        )}
                        <button className="button rounded-3 btn-no-border" onClick={() => {
                            setSelectedClinicalDiagnosis(null);
                            setIsEditClinicalDiagnosisModalOpen(true);
                        }}>
                            Add Clinical Diagnosis
                        </button>
                    </div>

                </div>
            </div>

            <div className="mt-1 rounded-1 treatment-vet element-space"
                     style={{marginTop: "30px", padding: "20px"}}>
                    <h3>Treatment Recommendations</h3>
                    {treatments.length > 0 ? (
                        <table cellPadding="3" cellSpacing="0" className="uniq-table">
                            <tbody>
                            {treatments.map((treatment) => (
                                <tr key={treatment.id}>
                                    <td>{treatment.treatment}
                                        <b>Name: {treatment.name}</b> {userRole === "ROLE_VET" && (
                                            <input
                                                type="checkbox"
                                                checked={treatment.isCompleted}
                                                onChange={() => handleCompleteTreatment(treatment.id)}
                                            />)} <br/>
                                        <b>Description</b>: {treatment.description} <br/>
                                        <b>Prescribed Medication</b>: {treatment.prescribedMedication} <br/>
                                        <b>Duration</b>: {treatment.duration} <br/>
                                        <button className="button btn-no-border" onClick={() => {
                                            setSelectedTreatment(treatment);
                                            setIsEditTreatmentModalOpen(true);
                                        }}>
                                            Edit treatment recommendation
                                        </button>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No treatment recommendations found.</p>
                    )}
                    {userRole === "ROLE_VET" && (
                        <button className="button rounded-3 btn-no-border" onClick={() => {
                            setSelectedTreatment(null);
                            setIsEditTreatmentModalOpen(true);
                        }}>
                            Add New Treatment
                        </button>
                    )}
                </div>

                {isAppointmentModalOpen && (
                    <AppointmentModal
                        appointment={appointment}
                        onClose={() => setIsAppointmentModalOpen(false)}
                    />
                )}

                {isEditDiagnosisModalOpen && (
                    <EditDiagnosisModal
                        diagnosis={diagnosis}
                        onClose={() => setIsEditDiagnosisModalOpen(false)}
                        onSave={handleSaveDiagnosis}
                    />
                )}

                {isEditExaminationPlanModalOpen && (
                    <EditExaminationPlanModal
                        examinationPlan={diagnosis?.examinationPlan}
                        onClose={() => setIsEditExaminationPlanModalOpen(false)}
                        onSave={handleSaveExaminationPlan}
                    />
                )}

                {isEditClinicalDiagnosisModalOpen && (
                    <EditClinicalDiagnosisModal
                        diagnosis={selectedClinicalDiagnosis}
                        onClose={() => setIsEditClinicalDiagnosisModalOpen(false)}
                        onSave={handleSaveClinicalDiagnosis}
                    />
                )}

                {isEditTreatmentModalOpen && (
                    <EditTreatmentModal
                        treatment={selectedTreatment}
                        onClose={() => setIsEditTreatmentModalOpen(false)}
                        onSave={handleSaveTreatment}
                        diagnosisId={diagnosis?.id}
                        petId={petInfo?.id}
                    />
                )}

            </div>
            );
            };

            export default AnamnesisDetailsPage;