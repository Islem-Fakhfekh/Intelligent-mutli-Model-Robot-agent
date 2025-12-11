#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Pose2D, Twist
from sensor_msgs.msg import BatteryState, LaserScan
from std_msgs.msg import String
import math
import random

class TestPublisher(Node):
    def __init__(self):
        super().__init__('test_publisher')
        
        # Publishers
        self.pose_pub = self.create_publisher(Pose2D, '/robot/pose', 10)
        self.velocity_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.battery_pub = self.create_publisher(BatteryState, '/robot/battery', 10)
        self.scan_pub = self.create_publisher(LaserScan, '/scan', 10)
        self.status_pub = self.create_publisher(String, '/robot/status', 10)
        self.speech_pub = self.create_publisher(String, '/robot/speech', 10)
        
        # Simulation state
        self.x = 0.0
        self.y = 0.0
        self.theta = 0.0
        self.battery = 100.0
        self.time = 0.0
        
        # Timer to publish data
        self.create_timer(0.1, self.publish_data)
        
        self.get_logger().info('Test Publisher Started - Simulating robot data')
    
    def publish_data(self):
        self.time += 0.1
        
        # Simulate circular motion
        self.x = math.cos(self.time * 0.2) * 2
        self.y = math.sin(self.time * 0.2) * 2
        self.theta = self.time * 0.2
        
        # Publish pose
        pose_msg = Pose2D()
        pose_msg.x = self.x
        pose_msg.y = self.y
        pose_msg.theta = self.theta
        self.pose_pub.publish(pose_msg)
        
        # Publish velocity
        vel_msg = Twist()
        vel_msg.linear.x = 0.5
        vel_msg.angular.z = 0.2
        self.velocity_pub.publish(vel_msg)
        
        # Publish battery (slowly decreasing)
        self.battery = max(0, 100 - self.time * 0.1)
        battery_msg = BatteryState()
        battery_msg.percentage = self.battery / 100.0
        self.battery_pub.publish(battery_msg)
        
        # Publish LiDAR scan with random obstacles
        scan_msg = LaserScan()
        scan_msg.header.stamp = self.get_clock().now().to_msg()
        scan_msg.header.frame_id = 'laser'
        scan_msg.angle_min = 0.0
        scan_msg.angle_max = 2 * math.pi
        scan_msg.angle_increment = math.radians(1.0)
        scan_msg.range_min = 0.15
        scan_msg.range_max = 12.0
        
        ranges = []
        for i in range(360):
            # Random obstacles
            if random.random() < 0.05:
                ranges.append(random.uniform(0.5, 3.0))
            else:
                ranges.append(12.0)
        
        scan_msg.ranges = ranges
        self.scan_pub.publish(scan_msg)
        
        # Publish status
        status_msg = String()
        if self.battery < 20:
            status_msg.data = 'low_battery'
        elif abs(vel_msg.linear.x) > 0.1:
            status_msg.data = 'moving'
        else:
            status_msg.data = 'idle'
        self.status_pub.publish(status_msg)
        
        # Publish speech occasionally
        if int(self.time) % 5 == 0 and int(self.time * 10) % 10 == 0:
            speech_msg = String()
            speeches = [
                "Hello! I'm exploring the environment.",
                "Detected multiple obstacles ahead.",
                "Battery level is good.",
                "Navigation system active."
            ]
            speech_msg.data = random.choice(speeches)
            self.speech_pub.publish(speech_msg)

def main(args=None):
    rclpy.init(args=args)
    node = TestPublisher()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()