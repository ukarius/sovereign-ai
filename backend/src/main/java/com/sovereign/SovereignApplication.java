package com.sovereign;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SovereignApplication {

    public static void main(String[] args) {
        SpringApplication.run(SovereignApplication.class, args);
    }
}
