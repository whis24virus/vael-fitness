# Use explicit bookworm to match runtime GLIBC version
FROM rust:1-bookworm as builder
WORKDIR /app
COPY . .
# Enable offline mode for SQLx to build without DB connection
ENV SQLX_OFFLINE=true
RUN cargo build --release

# Runtime image must match builder OS version
FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/vael-server /usr/local/bin/vael-server
CMD ["vael-server"]
