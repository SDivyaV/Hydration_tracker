package com.example.watertracker.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "water_intake")
public class WaterIntake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private Integer milliliters;

    public WaterIntake() {
    }

    public WaterIntake(LocalDate date, Integer milliliters) {
        this.date = date;
        this.milliliters = milliliters;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getMilliliters() {
        return milliliters;
    }

    public void setMilliliters(Integer milliliters) {
        this.milliliters = milliliters;
    }
}
