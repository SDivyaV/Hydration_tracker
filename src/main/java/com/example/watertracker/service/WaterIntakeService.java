package com.example.watertracker.service;

import com.example.watertracker.model.WaterIntake;
import com.example.watertracker.repository.WaterIntakeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class WaterIntakeService {

    private final WaterIntakeRepository repository;

    public WaterIntakeService(WaterIntakeRepository repository) {
        this.repository = repository;
    }

    public List<WaterIntake> findAll() {
        return repository.findAll();
    }

    public WaterIntake save(WaterIntake waterIntake) {
        return repository.save(waterIntake);
    }

    public int getTodayTotalMilliliters() {
        return repository.findByDate(LocalDate.now()).stream()
                .map(WaterIntake::getMilliliters)
                .filter(milliliters -> milliliters != null)
                .mapToInt(Integer::intValue)
                .sum();
    }
}
