import asyncio
import json
import aio_pika
from typing import Dict, Any

# This would be the Python AI worker that processes messages from RabbitMQ
# For now, this is a simplified version showing the concept

async def process_document_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Process a document and return results"""
    print(f"Processing document: {payload['document']['title']}")
    
    # In a real implementation, this would use AI to process the document
    # For now, we'll just return a success message
    return {"status": "success", "processed_document_id": "doc_123"}

async def generate_questions_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Generate questions from a document"""
    print(f"Generating {payload['numQuestions']} questions for document: {payload['document']['title']}")
    
    # In a real implementation, this would use AI to generate questions
    # For now, we'll return mock questions
    questions = []
    for i in range(payload['numQuestions']):
        questions.append({
            "content": f"Mock question {i+1} about {payload['document']['title']}",
            "type": "mcq",
            "correctAnswer": "Option A",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "points": 10
        })
    
    return {"questions": questions}

async def evaluate_answer_task(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate an answer"""
    print(f"Evaluating answer for question: {payload['question'][:50]}...")
    
    # In a real implementation, this would use AI to evaluate the answer
    # For now, we'll return a random result
    import random
    is_correct = random.choice([True, False])
    
    return {"isCorrect": is_correct, "explanation": "AI evaluation result"}

async def process_task(task: Dict[str, Any]) -> Dict[str, Any]:
    """Process a task based on its type"""
    task_type = task.get("type")
    payload = task.get("payload", {})
    
    if task_type == "PROCESS_DOCUMENT":
        return await process_document_task(payload)
    elif task_type == "GENERATE_QUESTIONS":
        return await generate_questions_task(payload)
    elif task_type == "EVALUATE_ANSWER":
        return await evaluate_answer_task(payload)
    else:
        return {"error": f"Unknown task type: {task_type}"}

async def main():
    # Connect to RabbitMQ
    import os
    rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://admin:password@localhost:5672/")
    connection = await aio_pika.connect_robust(rabbitmq_url)

    # Creating channel
    channel = await connection.channel()

    # Declare task queue
    task_queue = await channel.declare_queue('ai_tasks_queue', durable=True)
    
    # Declare response queue
    response_queue = await channel.declare_queue('ai_responses_queue', durable=True)

    async def on_task_message(message):
        """
        on_task_message doesn't necessarily have to be defined as async.
        Here it is to show that it's possible.
        """
        print(f"Received task: {message.body.decode()}")
        
        # Decode the task
        task = json.loads(message.body.decode())
        task_id = task.get("taskId", "unknown")
        
        # Process the task
        result = await process_task(task)
        
        # Prepare response
        response = {
            "taskId": task_id,
            "result": result
        }
        
        # Send response back
        await channel.default_exchange.publish(
            aio_pika.Message(
                json.dumps(response).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=response_queue.name
        )
        
        print(f"Sent response for task {task_id}")

        # Manually acknowledge the message
        await message.ack()

    # Start listening for tasks
    await task_queue.consume(on_task_message)

    print("Python AI Worker is listening for tasks... Press CTRL+C to exit.")
    
    # Keep the worker running
    try:
        # Wait until terminate
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down worker...")
        await connection.close()

if __name__ == "__main__":
    asyncio.run(main())