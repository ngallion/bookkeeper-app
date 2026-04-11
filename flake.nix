{
  description = "Bookkeeper — React PWA dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          name = "bookkeeper-env";

          packages = with pkgs; [
            nodejs_22
            git
            prettier
          ];

          shellHook = ''
            echo "Bookkeeper dev env — Node $(node --version), npm $(npm --version)"
          '';
        };
      });
}
