package com.example.watertracker.controller;

import com.example.watertracker.model.WaterIntake;
import com.example.watertracker.service.WaterIntakeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class WaterIntakeController {

    private final WaterIntakeService service;

    public WaterIntakeController(WaterIntakeService service) {
        this.service = service;
    }

    @GetMapping("/api/water-intake")
    public List<WaterIntake> listAll() {
        return service.findAll();
    }

    @PostMapping("/water")
    public ResponseEntity<WaterIntake> create(@RequestBody WaterIntake waterIntake) {
        WaterIntake savedWaterIntake = service.save(waterIntake);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedWaterIntake);
    }

    @GetMapping("/water/today")
    public int getTodayTotal() {
        return service.getTodayTotalMilliliters();
    }
}
