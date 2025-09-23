"""
Transaction Management System with MongoDB
Handles transaction storage and retrieval for user-specific fraud detection data
"""

import os
from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Optional
import uuid
from bson import ObjectId

class TransactionManager:
    def __init__(self):
        """Initialize MongoDB connection for transactions"""
        try:
            # MongoDB connection string - using local MongoDB instance
            self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client['frauddetection']
            self.transactions_collection = self.db['transactions']
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB successfully")
            
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            print("💡 Make sure MongoDB is running locally or update MONGODB_URI")
            raise

    def determine_transaction_status(self, risk_score: float) -> str:
        """
        Determine transaction status based on ML model risk score
        
        Args:
            risk_score: Risk score from ML model (0-1 scale)
            
        Returns:
            Transaction status: 'approved', 'flagged', or 'blocked'
        """
        if risk_score >= 0.7:
            return 'blocked'    # High Risk
        elif risk_score >= 0.2:
            return 'flagged'    # Medium Risk or Low Risk (needs review)
        else:
            return 'approved'   # Safe

    def create_transaction(self, user_email: str, transaction_data: Dict) -> Dict:
        """
        Store a new transaction for a user
        
        Args:
            user_email: Email of the user making the transaction
            transaction_data: Transaction details including ML prediction results
            
        Returns:
            Dictionary with success status and transaction details
        """
        try:
            # Extract ML prediction results
            fraud_prediction_data = transaction_data.get('fraudPrediction', {})
            risk_score = fraud_prediction_data.get('riskScore', 0)
            
            # Calculate transaction status based on ML risk score
            transaction_status = self.determine_transaction_status(risk_score)
            
            # Prepare transaction document
            transaction = {
                'user_email': user_email,
                'transaction_id': transaction_data.get('transactionId', str(uuid.uuid4())),
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now(),
                
                # Core transaction fields
                'amount': float(transaction_data.get('transactionAmount', 0)),
                'account_balance': float(transaction_data.get('accountBalance', 0)),
                'transaction_type': transaction_data.get('transactionType'),
                'device_type': transaction_data.get('deviceType'),
                'merchant_category': transaction_data.get('merchantCategory'),
                'location': transaction_data.get('location'),
                
                # Security and ML fields
                'ip_address_flag': transaction_data.get('ipAddressFlag'),
                'previous_fraudulent_activity': transaction_data.get('previousFraudulentActivity'),
                
                # Transaction status (calculated from ML prediction)
                'status': transaction_status,
                
                # ML Model Prediction Results
                'fraud_prediction': {
                    'is_fraud': fraud_prediction_data.get('isFraud', risk_score >= 0.7),
                    'risk_score': risk_score,
                    'classification': fraud_prediction_data.get('classification', 'Unknown'),
                    'confidence': fraud_prediction_data.get('confidence', 0),
                    'model_version': fraud_prediction_data.get('modelVersion', '1.0')
                },
                
                # Metadata
                'source': 'web_form',
                'processed': True
            }
            
            # Insert transaction into MongoDB
            result = self.transactions_collection.insert_one(transaction)
            
            # Return the created transaction with MongoDB ID
            transaction['_id'] = str(result.inserted_id)
            
            return {
                'success': True,
                'message': 'Transaction stored successfully',
                'transaction': transaction
            }
            
        except Exception as e:
            print(f"Error creating transaction: {e}")
            return {
                'success': False,
                'message': f'Failed to store transaction: {str(e)}'
            }

    def get_user_transactions(self, user_email: str, limit: int = 100, skip: int = 0) -> Dict:
        """
        Retrieve all transactions for a specific user
        
        Args:
            user_email: Email of the user
            limit: Maximum number of transactions to return
            skip: Number of transactions to skip (for pagination)
            
        Returns:
            Dictionary with success status and list of transactions
        """
        try:
            # Query transactions for the user, sorted by newest first
            cursor = self.transactions_collection.find(
                {'user_email': user_email}
            ).sort('created_at', -1).skip(skip).limit(limit)
            
            transactions = []
            for doc in cursor:
                # Convert ObjectId to string for JSON serialization
                doc['_id'] = str(doc['_id'])
                transactions.append(doc)
            
            # Get total count for pagination
            total_count = self.transactions_collection.count_documents({'user_email': user_email})
            
            return {
                'success': True,
                'transactions': transactions,
                'total_count': total_count,
                'returned_count': len(transactions)
            }
            
        except Exception as e:
            print(f"Error retrieving transactions: {e}")
            return {
                'success': False,
                'message': f'Failed to retrieve transactions: {str(e)}',
                'transactions': []
            }

    def get_transaction_stats(self, user_email: str) -> Dict:
        """
        Get transaction statistics for a user (for dashboard charts)
        
        Args:
            user_email: Email of the user
            
        Returns:
            Dictionary with transaction statistics
        """
        try:
            # Aggregation pipeline for statistics
            pipeline = [
                {'$match': {'user_email': user_email}},
                {'$group': {
                    '_id': None,
                    'total_transactions': {'$sum': 1},
                    'total_amount': {'$sum': '$amount'},
                    'avg_amount': {'$avg': '$amount'},
                    'fraud_count': {
                        '$sum': {
                            '$cond': ['$fraud_prediction.is_fraud', 1, 0]
                        }
                    },
                    'high_risk_count': {
                        '$sum': {
                            '$cond': [
                                {'$gte': ['$fraud_prediction.risk_score', 0.7]}, 
                                1, 0
                            ]
                        }
                    },
                    'approved_count': {
                        '$sum': {
                            '$cond': [
                                {'$eq': ['$status', 'approved']}, 
                                1, 0
                            ]
                        }
                    },
                    'flagged_count': {
                        '$sum': {
                            '$cond': [
                                {'$eq': ['$status', 'flagged']}, 
                                1, 0
                            ]
                        }
                    },
                    'blocked_count': {
                        '$sum': {
                            '$cond': [
                                {'$eq': ['$status', 'blocked']}, 
                                1, 0
                            ]
                        }
                    }
                }}
            ]
            
            result = list(self.transactions_collection.aggregate(pipeline))
            
            if result:
                stats = result[0]
                del stats['_id']  # Remove the _id field
                
                # Calculate fraud rate
                if stats['total_transactions'] > 0:
                    stats['fraud_rate'] = stats['fraud_count'] / stats['total_transactions']
                    stats['high_risk_rate'] = stats['high_risk_count'] / stats['total_transactions']
                    stats['approved_rate'] = stats['approved_count'] / stats['total_transactions']
                    stats['flagged_rate'] = stats['flagged_count'] / stats['total_transactions']
                    stats['blocked_rate'] = stats['blocked_count'] / stats['total_transactions']
                else:
                    stats['fraud_rate'] = 0
                    stats['high_risk_rate'] = 0
                    stats['approved_rate'] = 0
                    stats['flagged_rate'] = 0
                    stats['blocked_rate'] = 0
                    
                return {
                    'success': True,
                    'stats': stats
                }
            else:
                # No transactions found
                return {
                    'success': True,
                    'stats': {
                        'total_transactions': 0,
                        'total_amount': 0,
                        'avg_amount': 0,
                        'fraud_count': 0,
                        'high_risk_count': 0,
                        'approved_count': 0,
                        'flagged_count': 0,
                        'blocked_count': 0,
                        'fraud_rate': 0,
                        'high_risk_rate': 0,
                        'approved_rate': 0,
                        'flagged_rate': 0,
                        'blocked_rate': 0
                    }
                }
                
        except Exception as e:
            print(f"Error getting transaction stats: {e}")
            return {
                'success': False,
                'message': f'Failed to get statistics: {str(e)}',
                'stats': {}
            }

    def get_transaction_by_id(self, transaction_id: str, user_email: str) -> Dict:
        """
        Get a specific transaction by ID (ensuring user owns it)
        
        Args:
            transaction_id: Transaction ID
            user_email: Email of the user (for security)
            
        Returns:
            Dictionary with transaction details
        """
        try:
            # Find transaction by ID and user email
            transaction = self.transactions_collection.find_one({
                '$or': [
                    {'_id': ObjectId(transaction_id)},
                    {'transaction_id': transaction_id}
                ],
                'user_email': user_email
            })
            
            if transaction:
                transaction['_id'] = str(transaction['_id'])
                return {
                    'success': True,
                    'transaction': transaction
                }
            else:
                return {
                    'success': False,
                    'message': 'Transaction not found or access denied'
                }
                
        except Exception as e:
            print(f"Error retrieving transaction: {e}")
            return {
                'success': False,
                'message': f'Failed to retrieve transaction: {str(e)}'
            }

    def delete_transaction(self, transaction_id: str, user_email: str) -> Dict:
        """
        Delete a transaction (ensuring user owns it)
        
        Args:
            transaction_id: Transaction ID
            user_email: Email of the user (for security)
            
        Returns:
            Dictionary with success status
        """
        try:
            result = self.transactions_collection.delete_one({
                '$or': [
                    {'_id': ObjectId(transaction_id)},
                    {'transaction_id': transaction_id}
                ],
                'user_email': user_email
            })
            
            if result.deleted_count > 0:
                return {
                    'success': True,
                    'message': 'Transaction deleted successfully'
                }
            else:
                return {
                    'success': False,
                    'message': 'Transaction not found or access denied'
                }
                
        except Exception as e:
            print(f"Error deleting transaction: {e}")
            return {
                'success': False,
                'message': f'Failed to delete transaction: {str(e)}'
            }

    def close_connection(self):
        """Close MongoDB connection"""
        if hasattr(self, 'client'):
            self.client.close()