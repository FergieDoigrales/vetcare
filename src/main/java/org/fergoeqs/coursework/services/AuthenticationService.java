package org.fergoeqs.coursework.services;

import org.fergoeqs.coursework.controllers.UserController;
import org.fergoeqs.coursework.dto.LoginUserDto;
import org.fergoeqs.coursework.dto.RegisterUserDto;
import org.fergoeqs.coursework.models.AppUser;
import org.fergoeqs.coursework.models.enums.RoleType;
import org.fergoeqs.coursework.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AppUser signup(RegisterUserDto input) {
        AppUser user = new AppUser();
        user.setUsername(input.username());
        user.setPassword(passwordEncoder.encode(input.password()));
        user.setEmail(input.email());
        user.setPhoneNumber(input.phoneNumber());
        user.setName(input.name());
        user.setSurname(input.surname());
        user.setRoles(new HashSet<>(Set.of(RoleType.USER)));

        logger.info("User roles before save: {}", user.getRoles());

        AppUser savedUser = userRepository.save(user);
        logger.info("User after save: {}", savedUser);

        return savedUser;
    }


    public AppUser authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.username(),
                        input.password()
                )
        );

        return userRepository.findByUsername(input.username())
                .orElseThrow();
    }
}