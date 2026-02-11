# Use latest Rust (likely Bookworm-based, but links fine)
FROM rust:latest as builder
WORKDIR /app
COPY . .
# Enable offline mode for SQLx to build without DB connection
ENV SQLX_OFFLINE=true
RUN cargo build --release

# Runtime image with newer GLIBC (2.39) to support fastembed/ort requirements
FROM ubuntu:24.04
WORKDIR /app
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/vael-server /usr/local/bin/vael-server
CMD ["vael-server"]
