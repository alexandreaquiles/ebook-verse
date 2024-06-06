docker exec -it ebook-verse-kafka-1 kafka-topics.sh --bootstrap-server localhost:9092 --create --topic novos-pedidos-particionado --partitions 2
