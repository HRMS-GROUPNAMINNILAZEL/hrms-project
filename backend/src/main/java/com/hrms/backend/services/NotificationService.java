package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.Notification;
import com.hrms.backend.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    public List<Notification> getByUserId(Integer userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Integer userId) {
        return repo.countByUserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Integer notificationId) {
        repo.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            repo.save(n);
        });
    }

    public void markAllRead(Integer userId) {
        List<Notification> unread = repo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        repo.saveAll(unread);
    }

    public Notification create(Integer userId, String message, String type) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setType(type);
        return repo.save(n);
    }
}
