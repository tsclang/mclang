{
  "targets": [
    {
      "target_name": "number_theory",
      "sources": [
        "number_theory.c",
        "number_theory_napi.c"
      ],
      "conditions": [
        [
          "OS!='win'",
          {
            "libraries": [
              "-lm"
            ]
          }
        ]
      ]
    }
  ]
}
