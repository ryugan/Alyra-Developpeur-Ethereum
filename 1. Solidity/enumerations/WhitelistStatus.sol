// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

enum WhitelistStatus {
    Unknown, // @correcteur Si un utilisateur venait à être ajouté par hasard, il ne sera pas autorisé et en même temps identifiable car dans un état atypique
    Refused,
    Authorized
}