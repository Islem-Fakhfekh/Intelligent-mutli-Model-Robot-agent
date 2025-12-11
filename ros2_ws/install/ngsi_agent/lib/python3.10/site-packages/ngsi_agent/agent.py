#!/usr/bin/env python3
import rclpy
from rclpy.node import Node

class NGSIAgent(Node):
    def __init__(self):
        super().__init__('ngsi_agent')
        self.get_logger().info('✓ NGSI Agent démarré avec succès!')
        self.counter = 0
        self.create_timer(1.0, self.timer_callback)
    
    def timer_callback(self):
        self.counter += 1
        self.get_logger().info(f'Agent en cours d\'exécution... {self.counter}s')

def main(args=None):
    rclpy.init(args=args)
    agent = NGSIAgent()
    try:
        rclpy.spin(agent)
    except KeyboardInterrupt:
        pass
    finally:
        agent.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
