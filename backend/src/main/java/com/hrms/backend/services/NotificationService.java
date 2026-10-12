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

    public void markAsRead(Integer notificationId, Integer userId) {
        repo.findById(notificationId).ifPresent(n -> {
            if (userId != null && !n.getUserId().equals(userId)) {
                return;
            }
            n.setIsRead(true);
            repo.save(n);
        });
    }

    public void markAsRead(Integer notificationId) {
        markAsRead(notificationId, null);
    }

    public void markAllRead(Integer userId) {
        List<Notification> unread = repo.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setIsRead(true));
        repo.saveAll(unread);
    }

    public Notification create(Integer userId, String message, String type) {
        Notification n = new Notification();
        n.setUserId(userId);
        if (message != null && message.length() > 500) {
            message = message.substring(0, 497) + "...";
        }
        n.setMessage(message);
        n.setType(type);
        return repo.save(n);
    }
}
