package com.sovereign.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Phase 3 — RabbitMQ configuration with exchanges, queues, and DLQ for retries.
 */
@Configuration
public class RabbitConfig {

    // ───── Exchange ─────
    public static final String PUBLISHING_EXCHANGE = "exchange.publishing";
    public static final String DLX_EXCHANGE = "exchange.publishing.dlx";

    // ───── Queues ─────
    public static final String INSTAGRAM_QUEUE = "queue.instagram";
    public static final String INSTAGRAM_DLQ = "queue.instagram.dlq";

    // ───── Routing Keys ─────
    public static final String INSTAGRAM_ROUTING_KEY = "publish.instagram";

    @Bean
    public TopicExchange publishingExchange() {
        return new TopicExchange(PUBLISHING_EXCHANGE);
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    @Bean
    public Queue instagramQueue() {
        return QueueBuilder.durable(INSTAGRAM_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", INSTAGRAM_DLQ)
                .build();
    }

    @Bean
    public Queue instagramDeadLetterQueue() {
        return QueueBuilder.durable(INSTAGRAM_DLQ)
                .withArgument("x-message-ttl", 30000) // Retry after 30 seconds
                .withArgument("x-dead-letter-exchange", PUBLISHING_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", INSTAGRAM_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding instagramBinding(Queue instagramQueue, TopicExchange publishingExchange) {
        return BindingBuilder.bind(instagramQueue).to(publishingExchange).with(INSTAGRAM_ROUTING_KEY);
    }

    @Bean
    public Binding instagramDlqBinding(Queue instagramDeadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(instagramDeadLetterQueue).to(deadLetterExchange).with(INSTAGRAM_DLQ);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jsonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter);
        return template;
    }
}
