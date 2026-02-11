FROM rust:1.80 as builder
WORKDIR /app
COPY . .
RUN ls -la /app
# Enable offline mode for SQLx to build without DB connection
ENV SQLX_OFFLINE=true
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/vael-server /usr/local/bin/vael-server
# Install ca-certificates for HTTPS/Database connections
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
CMD ["vael-server"]
