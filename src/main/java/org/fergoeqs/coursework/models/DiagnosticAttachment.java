package org.fergoeqs.coursework.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "diagnostic_attachment")
@Getter
@Setter

public class DiagnosticAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String name;
    private String description;
    @NotNull
    private String fileUrl;
    private LocalDateTime uploadDate;

    @ManyToOne
    @JoinColumn(name = "anamnesis_id")
    private Anamnesis anamnesis;

    @ManyToOne
    @JoinColumn(name = "diagnosis_id")
    private Diagnosis diagnosis;
}